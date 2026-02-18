from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re

# ── App setup ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # lets your browser extension call this API without security errors

# ── Load model ─────────────────────────────────────────────────────────────────
print("Loading model...")
pipeline = joblib.load("toxic_model.pkl")
print("Model loaded successfully.")

LABEL_COLS = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']


def clean_text(text):
    text = text.lower()
    text = re.sub(r'\r\n', ' ', text)
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


# ── Prediction endpoint ────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    # Validate that we received something
    if not data or 'texts' not in data:
        return jsonify({'error': 'Request must include a "texts" field'}), 400

    texts = data['texts']

    # Validate it's a non-empty list
    if not isinstance(texts, list) or len(texts) == 0:
        return jsonify({'error': '"texts" must be a non-empty list of strings'}), 400

    # Clean and predict
    cleaned = [clean_text(t) for t in texts]
    predictions = pipeline.predict(cleaned)

    # Build response — one result object per input text
    results = []
    for i in range(len(texts)):
        result = {}
        for j, label in enumerate(LABEL_COLS):
            result[label] = int(predictions[i][j])  # 0 or 1

        # is_toxic is True if ANY label fired
        result['is_toxic'] = int(any(predictions[i]))
        results.append(result)

    return jsonify(results)


# ── Health check endpoint ──────────────────────────────────────────────────────
# Visit http://localhost:5000/ in your browser to confirm the server is running
@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'API is running'})


# ── Start server ───────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(port=5000, debug=True, ssl_context='adhoc')
    # debug=True means the server auto-restarts when you edit app.py
    # Turn this off when deploying to production
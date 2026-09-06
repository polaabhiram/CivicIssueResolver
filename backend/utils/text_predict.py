import torch
import pickle
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# 🔥 LOAD TOKENIZER FROM HUGGINGFACE (NOT LOCAL)
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

# 🔥 LOAD YOUR TRAINED MODEL
model = AutoModelForSequenceClassification.from_pretrained("models/text_model")

# Label encoder
le = pickle.load(open("models/label_encoder.pkl", "rb"))

model.eval()

def predict_text(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)
        conf, pred = torch.max(probs, 1)

    label = le.inverse_transform([pred.item()])[0]

    return label, conf.item()
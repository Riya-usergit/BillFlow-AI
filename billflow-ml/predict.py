from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

model = joblib.load("model.pkl")


class PredictionRequest(BaseModel):
    invoiceAmount: float
    daysToPay: int


@app.post("/predict")
def predict(request: PredictionRequest):

    prediction = model.predict([
        [
            request.invoiceAmount,
            request.daysToPay
        ]
    ])	
	

    probability = model.predict_proba([
        [
            request.invoiceAmount,
            request.daysToPay
        ]
    ])

    return {
        "latePaymentPrediction": int(prediction[0]),
        "latePaymentProbability": float(
            probability[0][1]
        )
    }
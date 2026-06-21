import pandas as pd
import random

data = []

for _ in range(1000):

    invoice_amount = random.randint(5000, 200000)

    days_to_pay = random.randint(1, 40)

    # Business rule for generating realistic labels
    if days_to_pay > 15:
        paid_late = 1
    elif invoice_amount > 100000 and days_to_pay > 10:
        paid_late = 1
    else:
        paid_late = 0

    data.append([
        invoice_amount,
        days_to_pay,
        paid_late
    ])

df = pd.DataFrame(
    data,
    columns=[
        "invoiceAmount",
        "daysToPay",
        "paidLate"
    ]
)

df.to_csv("data.csv", index=False)

print("Generated 1000 training records!")
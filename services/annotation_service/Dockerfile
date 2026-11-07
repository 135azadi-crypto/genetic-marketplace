FROM python:3.11-slim

WORKDIR /app

# نصب پکیج‌های سیستمی مورد نیاز
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# کپی و نصب پکیج‌های پایتون
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# کپی کردن بقیه فایل‌ها
COPY . .

# اجرای برنامه با استفاده از python -m (مطمئن‌ترین روش)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]

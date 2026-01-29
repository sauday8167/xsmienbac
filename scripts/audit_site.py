
import requests
import sys
from bs4 import BeautifulSoup
import time

BASE_URL = "http://localhost:3000"

ROUTES = [
    "/",
    "/du-doan-ai",
    "/du-doan",
    "/soi-cau-bac-nho",
    "/bac-nho-khung-3-ngay",
    "/soi-cau-bach-thu",
    "/thong-ke-theo-thu",
    "/thong-ke-theo-ngay",
    "/soi-cau-loto-roi",
    "/soi-cau-giai-dac-biet",
    "/thong-ke/loto-3-4-cang",
    "/so-mo",
    "/quay-thu"
]

def check_route(route):
    url = f"{BASE_URL}{route}"
    try:
        start_time = time.time()
        response = requests.get(url, timeout=10)
        elapsed = time.time() - start_time
        
        status = response.status_code
        if status == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.title.string.strip() if soup.title else "No Title"
            
            # Simple error check in content
            content = response.text.lower()
            errors = []
            if "runtime error" in content: errors.append("Runtime Error")
            if "build error" in content: errors.append("Build Error")
            if "application error" in content: errors.append("App Error")
            
            if errors:
                return False, f"Errors found: {', '.join(errors)}"
                
            return True, f"OK ({elapsed:.2f}s) - Title: {title[:50]}..."
        else:
            return False, f"Status Code: {status}"
            
    except Exception as e:
        return False, f"Exception: {str(e)}"

def run_audit():
    print(f"Starting audit for {BASE_URL}...")
    failed = 0
    passed = 0
    
    for route in ROUTES:
        print(f"Checking {route:<25} ... ", end="", flush=True)
        success, msg = check_route(route)
        if success:
            print(f"PASS | {msg}")
            passed += 1
        else:
            print(f"FAIL | {msg}")
            failed += 1
            
    print("-" * 50)
    print(f"Audit Complete. Passed: {passed}, Failed: {failed}")
    
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    try:
        run_audit()
    except KeyboardInterrupt:
        print("\nAudit interrupted.")

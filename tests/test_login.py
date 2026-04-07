import os

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

EMAIL = os.getenv("QUIDDLE_TEST_EMAIL")
PASSWORD = os.getenv("QUIDDLE_TEST_PASSWORD")

def login(driver):
    driver.get("http://localhost:3000/login")

    driver.find_element(By.NAME, "email").send_keys(EMAIL)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.XPATH, "//button[text()='Login']").click()

    WebDriverWait(driver, 10).until(EC.url_changes("http://localhost:3000/login"))

# tests wrong password
def test_login_wrong_password(driver):
    driver.get("http://localhost:3000/login")

    driver.find_element(By.NAME, "email").send_keys("test@test.com")
    driver.find_element(By.NAME, "password").send_keys("wrongpassword")
    driver.find_element(By.XPATH, "//button[text()='Login']").click()

    alert = WebDriverWait(driver, 10).until(EC.alert_is_present())
    assert alert.text == "Invalid email or password."
    alert.accept()

# tests correct login
def test_login_success(driver):
    
    login(driver)

    assert "/login" not in driver.current_url

# tests logout
def test_logout(driver):

    login(driver)

    #then logout
    logout = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//*[normalize-space(text())='Log Out']"))
    )
    logout.click()

    WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.XPATH, "//*[normalize-space(text())='Login']"))
    )

    assert "Login" in driver.page_source
    assert "Log Out" not in driver.page_source
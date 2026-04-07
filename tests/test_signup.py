from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC


# actual signup test removed to prevent creating accounts


# tests required fields
def test_signup_required_fields(driver):
    driver.get("http://localhost:3000/signup")

    driver.find_element(By.XPATH, "//button[text()='Create Account']").click()

    error = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Required')]"))
    )
    assert "Required" in error.text


# tests signup password mismatch
def test_signup_password_mismatch(driver):
    driver.get("http://localhost:3000/signup")

    driver.find_element(By.ID, "firstName").send_keys("Test")
    driver.find_element(By.ID, "middleName").send_keys("User")
    driver.find_element(By.ID, "lastName").send_keys("Account")
    driver.find_element(By.ID, "institutionID").send_keys("BCIT")
    driver.find_element(By.ID, "email").send_keys("test@my.bcit.ca")
    driver.find_element(By.ID, "password").send_keys("Password@123")
    driver.find_element(By.ID, "confirmPassword").send_keys("Password@124")

    driver.find_element(By.XPATH, "//button[text()='Create Account']").click()

    error = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Passwords must match')]"))
    )
    assert "Passwords must match" in error.text


# tests invalid email
def test_signup_invalid_email(driver):
    driver.get("http://localhost:3000/signup")

    driver.find_element(By.ID, "firstName").send_keys("Test")
    driver.find_element(By.ID, "middleName").send_keys("User")
    driver.find_element(By.ID, "lastName").send_keys("Account")

    institution = Select(driver.find_element(By.ID, "institutionID"))
    institution.select_by_visible_text("BCIT")

    driver.find_element(By.ID, "email").send_keys("notanemail")
    driver.find_element(By.ID, "password").send_keys("Password@123")
    driver.find_element(By.ID, "confirmPassword").send_keys("Password@123")

    driver.find_element(By.XPATH, "//button[text()='Create Account']").click()

    error = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Invalid email')]"))
    )
    assert "Invalid email" in error.text
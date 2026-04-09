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


# tests that page loads fine
def test_quiz_create_page_loads(driver):
    
    #login first
    login(driver)

    driver.get("http://localhost:3000/quizcreate")

    wait = WebDriverWait(driver, 10)

    assert wait.until(
        EC.presence_of_element_located((By.XPATH, "//h1[normalize-space(text())='Quiz Creation']"))
    )
    assert wait.until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='eg. Midterm Practice']"))
    )
    assert wait.until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='e.g. MATH101']"))
    )
    assert wait.until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Select subject')]"))
    )
    assert wait.until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Add Question')]"))
    )

# test for empty required field
def test_quiz_create_blank_question_not_allowed(driver):
    login(driver)

    driver.get("http://localhost:3000/quizcreate")

    wait = WebDriverWait(driver, 10)

    add_question = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Add Question')]"))
    )
    add_question.click()

    alert = wait.until(EC.alert_is_present())
    assert alert.text == "Please enter a question"
    alert.accept()

# test for 4 options in multiple choice
def test_quiz_create_mc_has_four_options_by_default(driver):
    login(driver)

    driver.get("http://localhost:3000/quizcreate")

    wait = WebDriverWait(driver, 10)
    wait.until(
        EC.presence_of_element_located((By.XPATH, "//h1[normalize-space(text())='Quiz Creation']"))
    )

    option_inputs = driver.find_elements(By.XPATH, "//input[contains(@placeholder, 'Option ')]")
    assert len(option_inputs) == 4
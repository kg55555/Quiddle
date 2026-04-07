import os

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

EMAIL = os.getenv("QUIDDLE_TEST_EMAIL")
PASSWORD = os.getenv("QUIDDLE_TEST_PASSWORD")

#login function
def login(driver):
    driver.get("http://localhost:3000/login")

    driver.find_element(By.NAME, "email").send_keys(EMAIL)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.XPATH, "//button[text()='Login']").click()

    WebDriverWait(driver, 10).until(EC.url_changes("http://localhost:3000/login"))

# quiz browse works even when not loggedin
def test_quiz_browse_page_loads(driver):
    driver.get("http://localhost:3000/browse")

    wait = WebDriverWait(driver, 10)

    assert wait.until(
        EC.presence_of_element_located((By.XPATH, "//h1[normalize-space(text())='Browse Quizzes']"))
    )



# login redirect when not authenticated
def test_quiz_card_redirects_login_when_logged_out(driver):
    driver.get("http://localhost:3000/browse")

    wait = WebDriverWait(driver, 10)

    card = wait.until(
        EC.element_to_be_clickable((By.XPATH, "(//div[contains(@class, 'flex-shrink-0')])[1]"))
    )
    card.click()

    wait.until(EC.url_contains("/login"))
    assert "/login" in driver.current_url


#quiz can be taken when logged in 
def test_quiz_card_opens_quiztake_when_logged_in(driver):
    login(driver)

    driver.get("http://localhost:3000/browse")

    wait = WebDriverWait(driver, 10)

    card = wait.until(
        EC.element_to_be_clickable((By.XPATH, "(//div[contains(@class, 'flex-shrink-0')])[1]"))
    )
    card.click()

    wait.until(EC.url_contains("/quiztake/"))
    assert "/quiztake/" in driver.current_url
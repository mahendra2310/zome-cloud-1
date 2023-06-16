package pageobjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.Keys;


import hooks.Utilities;
import hooks.base;

import java.security.PublicKey;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class loginpage {

    WebDriver driver;
    Utilities utilities;

    public String value = "";

    @FindBy(xpath = "//input[@id='j_username']")
    WebElement email;


    @FindBy(xpath = "//input[@placeholder='Password']")
    WebElement password;

    @FindBy(xpath = "//button[@name='Submit']")
    WebElement login;
    @FindBy(xpath = "//span[@class='build-status-icon__wrapper icon-aborted icon-md']")
    WebElement abortBadge;

    @FindBy(xpath = "//span[@class='build-status-icon__wrapper icon-red icon-md']")
    WebElement failedBadge;

    @FindBy(xpath = "//input[@id='username']")
    WebElement confEmail;

    @FindBy(xpath = "//input[@id='password']")
    WebElement confPass;

    @FindBy(xpath = "//button[@id='login-submit']//span[contains(text(),'Log in')]")
    WebElement conflogIn;


    @FindBy(xpath = "//button[@id='login-submit']//span[@class='css-178ag6o']")
    WebElement confContinue;

    @FindBy(xpath = "//a[@id='editPageLink']//span[@class='css-snhnyn']")
    WebElement confEditBtn;

    @FindBy(xpath = "//textarea[@placeholder='Give this page a title']\n")
    WebElement confPageTitle;


    @FindBy(xpath = "//div[@aria-label='Main content area, start typing to enter text.']//p")
    WebElement confPageBody;

    @FindBy(xpath = "//span[contains(text(),'Publish')]")
    WebElement confPublish;

    @FindBy(xpath = "//input[@placeholder='Search']")
    WebElement confSearch;
    @FindBy(xpath = "//span[@title='Tenant app Automation Job Pass/Fail']")
    WebElement confSelectPage;


    public loginpage(WebDriver driver) {
        this.driver = driver;
        utilities = new Utilities(driver);
        PageFactory.initElements(driver, this);
    }

    public void logIntoApplication() {
        driver.manage().window().fullscreen();
        utilities.waitForElementToDisplay(email);
        email.sendKeys("zome");
        password.sendKeys("E95K$j]\"Cc7)@{?U");
        login.click();
        driver.manage().window().fullscreen();
        if (utilities.isElementDisplayed(abortBadge)) {
            value = "Aborted";
        } else //if (utilities.isElementDisplayed(failedBadge)) {
        //value = "Failed";
        //} else
        {
            value = "Success";

        }
        System.out.println(value);
    }


    public void logIntoConfluence() throws InterruptedException {
        LocalDateTime currentDateTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String formattedDateTime = currentDateTime.format(formatter);
        // System.out.println("Current date and time: " + formattedDateTime);
        driver.get("https://start.atlassian.com/");
        driver.manage().window().fullscreen();
        Thread.sleep(5000);
        confEmail.sendKeys("arsany.attalla@bhojr.com");
        confContinue.click();
        confPass.sendKeys("123123123aA!");
        conflogIn.click();
        driver.manage().window().fullscreen();


    }

    public void uploadReport() throws InterruptedException {
        driver.manage().window().fullscreen();
        confSearch.sendKeys("Tenant app Automation Job Pass/Fail");
        utilities.waitForElementToDisplay(confSelectPage);
        confSelectPage.click();
        Thread.sleep(9000);
        confEditBtn.click();
        Thread.sleep(9000);
        Thread.sleep(9000);
        confPageBody.sendKeys(Keys.ENTER);
        confPageBody.sendKeys("Date: " + utilities.dateAndTime());
        confPageBody.sendKeys("        Status: " + value);
        confPageBody.sendKeys(Keys.ENTER);
        confPublish.click();
        Thread.sleep(9000);


    }


}

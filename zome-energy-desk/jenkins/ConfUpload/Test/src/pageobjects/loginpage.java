package pageobjects;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.Keys;
import hooks.Utilities;
import hooks.base;
import java.awt.*;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.security.PublicKey;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class    loginpage {

    WebDriver driver;
    Utilities utilities;

    public String value = "";
    public String currentUrl;


    @FindBy(xpath = "//input[@id='j_username']")
    WebElement email;


    @FindBy(xpath = "//input[@placeholder='Password']")
    WebElement password;

    @FindBy(xpath = "//button[@name='Submit']")
    WebElement login;
    @FindBy(xpath = "//span[@class='build-status-icon__wrapper icon-aborted icon-md']")
    WebElement abortBadge;

    @FindBy(xpath = "//tr[@id='job_TenantAppTestingAndroid']//span[@class='build-status-icon__wrapper icon-red icon-md']")
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

    @FindBy(xpath = "//span[@title='Gateway Validations']")
    WebElement confSelectPageValid;

    @FindBy(xpath = "//span[normalize-space()='TenantAppTestingAndroid']")
    WebElement TenantTest;

    @FindBy(xpath = "/html[1]/body[1]/div[4]/div[1]/div[2]/div[2]/div[2]/table[1]/tbody[1]/tr[2]/td[1]/div[1]/div[1]/a[1]")
    WebElement latestBuild;
    @FindBy(xpath = "//span[normalize-space()='Console Output']")
    WebElement consoleOutput;


    public loginpage(WebDriver driver) {
        this.driver = driver;
        utilities = new Utilities(driver);
        PageFactory.initElements(driver, this);
    }

    public void logIntoApplication() throws InterruptedException {
        driver.manage().window().fullscreen();
        utilities.waitForElementToDisplay(email);
        email.sendKeys("zome");
        password.sendKeys("E95K$j]\"Cc7)@{?U");
        login.click();
        driver.manage().window().fullscreen();
        if (utilities.isElementDisplayed(abortBadge)) {
            TenantTest.click();
            latestBuild.click();
            consoleOutput.click();
            WebElement hrefElement = driver.findElement(By.xpath("//a[contains(text(),'https://console.aws.amazon.com/devicefarm/home?#/p')]"));
            currentUrl = hrefElement.getAttribute("href");
            value = "Aborted";
        } else if (utilities.isElementDisplayed(failedBadge)) {
            TenantTest.click();
            latestBuild.click();
            Thread.sleep(4000);
            consoleOutput.click();
            WebElement hrefElement = driver.findElement(By.xpath("//a[contains(text(),'https://console.aws.amazon.com/devicefarm/home?#/p')]"));
            currentUrl = hrefElement.getAttribute("href");
            value = "Failed";
        } else {
            value = "Success";
        }
        System.out.println(value + currentUrl);
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
        if(value == "Success") {
            confPageBody.sendKeys("        Status: " + value);
        } else {
            confPageBody.sendKeys("        Status: " + value + "      "+currentUrl);

        }
        confPageBody.sendKeys(Keys.ENTER);
        confPublish.click();
        Thread.sleep(9000);
        Thread.sleep(9000);



    }

    public void uploadDispatchReport() throws InterruptedException, IOException {
        driver.manage().window().fullscreen();
        LocalDateTime currentDateTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDateTime = currentDateTime.format(formatter);
        driver.manage().window().fullscreen();
        confSearch.sendKeys("Gateway Validations");
        utilities.waitForElementToDisplay(confSelectPageValid);
        confSelectPageValid.click();
        Thread.sleep(9000);
        Thread.sleep(9000);
        driver.manage().window().fullscreen();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        WebElement confCreate = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[normalize-space()='Create']")));
        confCreate.click();
        Thread.sleep(9000);
        Thread.sleep(9000);
        confPageTitle.sendKeys(formattedDateTime+"  Dispatch Report for TESTBED-PROD");
        confPageTitle.sendKeys(Keys.RETURN);
        Thread.sleep(9000);
        BufferedReader reader = new BufferedReader(new FileReader("/var/lib/jenkins/workspace/DispatchLogParser/table.txt"));
        String line = reader.readLine();
        while (line != null) {
            confPageBody.sendKeys(line);
            confPageBody.sendKeys("\n"); // Add a new line after each line of input
            line = reader.readLine();
        }

        // Close the reader and the driver
        reader.close();
        // Enter file contents into file input element

        confPageBody.sendKeys(Keys.ENTER);
        Thread.sleep(9000);
        confPublish.click();
        WebDriverWait waitForPublish = new WebDriverWait(driver, Duration.ofSeconds(30));
        waitForPublish.until(ExpectedConditions.jsReturnsValue("return document.readyState === 'complete';"));


    }


}

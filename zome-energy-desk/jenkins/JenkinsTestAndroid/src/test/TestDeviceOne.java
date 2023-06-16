import io.appium.java_client.AppiumDriver;
import main.homepage;
import org.openqa.selenium.*;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import main.base;

import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.TimeUnit;


public class TestDeviceOne extends base {
    public static AppiumDriver driver;
    String baseUrl;
    public homepage home;

    public boolean isElementDisplayed(WebElement element) {
        try {
            return element.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    @BeforeTest
    public void setUp() throws Exception {
        DesiredCapabilities desiredCapabilities = new DesiredCapabilities();
        //desiredCapabilities.setCapability(MobileCapabilityType.PLATFORM_NAME, "iOS");
        //desiredCapabilities.setCapability(MobileCapabilityType.PLATFORM_VERSION, "13.1.3");
        //desiredCapabilities.setCapability(MobileCapabilityType.AUTOMATION_NAME, "XCUITest");
        //desiredCapabilities.setCapability(MobileCapabilityType.BROWSER_NAME, "Safari");
        //desiredCapabilities.setCapability(MobileCapabilityType.DEVICE_NAME, "iPhone 11");

        desiredCapabilities.setCapability(CapabilityType.BROWSER_NAME, "Chrome");
        desiredCapabilities.setCapability(CapabilityType.PLATFORM_NAME, "Android");
        desiredCapabilities.setCapability("autoGrantPermissions", true);
        desiredCapabilities.setCapability("noReset", true);
        desiredCapabilities.setCapability("fullReset", false);

        baseUrl = "https://app.zomepower.com";
        URL remoteUrl = new URL("http://localhost:4723/wd/hub");
        driver = new AppiumDriver(remoteUrl, desiredCapabilities);
        driver.get(baseUrl);
        driver.manage().timeouts().implicitlyWait(25, TimeUnit.SECONDS);
        System.out.println("Navigated to website");
        Thread.sleep(9000);
        home = new homepage(driver);



    }

    @Test
    public void addTempCheck() throws InterruptedException, MalformedURLException {
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//input[@type='email']"))),
                true);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//input[@type='password']"))),
                true);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[@class='login-btn-style" +
                " white-text-color block cursor-pointer text-center']"))), true);
        home.loginDevice("testbed-prod-3","testbed-prod-3" );
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[contains(text(),'+')]"))),
                true);
        try {
            Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[contains(text()," +
                    "'Set temperature')]"))), true);
            home.addTemp();
        } catch (Exception e) {
            System.out.println("Device is off");
        }
        home.logout();

        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//input[@type='email']"))),
                true);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//input[@type='password']"))),
                true);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[@class='login-btn-style" +
                " white-text-color block cursor-pointer text-center']"))), true);
        home.loginDevice("testbed-prod-5","testbed-prod-5" );
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[contains(text(),'+')]"))),
                true);
        try {
            Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[contains(text()," +
                    "'Set temperature')]"))), true);
            home.addTemp();
        } catch (Exception e) {
            System.out.println("Device is off");
        }


    }



}


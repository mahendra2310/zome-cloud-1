package main;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.remote.MobileCapabilityType;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;

import java.lang.reflect.Method;
import java.net.URL;
import java.util.concurrent.TimeUnit;

public class base {
    public static AppiumDriver driver;
    String baseUrl;
    public main.homepage home;


    //@BeforeMethod
    public void setUp(Method method) throws Exception {
        DesiredCapabilities desiredCapabilities = new DesiredCapabilities();
        desiredCapabilities.setCapability(MobileCapabilityType.PLATFORM_NAME, "iOS");
        desiredCapabilities.setCapability(MobileCapabilityType.PLATFORM_VERSION, "13.1.3");
        desiredCapabilities.setCapability(MobileCapabilityType.AUTOMATION_NAME, "XCUITest");
        desiredCapabilities.setCapability(MobileCapabilityType.BROWSER_NAME, "Safari");
        desiredCapabilities.setCapability(MobileCapabilityType.DEVICE_NAME, "iPhone 11");

        //desiredCapabilities.setCapability(CapabilityType.BROWSER_NAME, "Chrome");
        //desiredCapabilities.setCapability(CapabilityType.PLATFORM_NAME, "Android");
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
        home = new main.homepage(driver);


    }

}
package main;
import io.appium.java_client.android.AndroidDriver;

import io.appium.java_client.remote.MobilePlatform;
import org.openqa.selenium.*;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.lang.reflect.Method;
import java.net.URL;
import java.util.concurrent.TimeUnit;
public class base {
    public AndroidDriver driver;
    String baseUrl;


    @BeforeMethod
    public void setUp(Method method) throws Exception {
        DesiredCapabilities desiredCapabilities = new DesiredCapabilities();
        desiredCapabilities.setCapability("appium:appPackage", "org.chromium.webview_shell");
        desiredCapabilities.setCapability("appium:appActivity", "org.chromium.webview_shell.WebViewBrowserActivity");
        desiredCapabilities.setCapability("appium:udid", "emulator-5554");
        desiredCapabilities.setCapability("appium:automationName", "uiautomator2");
        desiredCapabilities.setCapability("appium:platformName", MobilePlatform.ANDROID);
        desiredCapabilities.setCapability("appium:deviceName", "Nexus6");
        desiredCapabilities.setCapability("appium:ensureWebviewsHavePages", true);
        desiredCapabilities.setCapability("autoGrantPermissions", true);
        baseUrl = "https://develop.zomepower.com";
        URL remoteUrl = new URL("http://localhost:4723/wd/hub");
           driver = new AndroidDriver(remoteUrl, desiredCapabilities);
           driver.get(baseUrl);
           driver.manage().timeouts().implicitlyWait(25, TimeUnit.SECONDS);
           System.out.println("Navigated to website");


    }

}
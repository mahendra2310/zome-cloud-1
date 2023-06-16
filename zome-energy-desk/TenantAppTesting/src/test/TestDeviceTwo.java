import io.appium.java_client.android.AndroidDriver;

import io.appium.java_client.remote.MobilePlatform;
import org.openqa.selenium.*;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.net.URL;
import java.util.concurrent.TimeUnit;
import main.base;



public class TestDeviceTwo extends base {



    @Test
    public void login() throws InterruptedException {

        WebElement uName = driver.findElement(By.xpath("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout[2]/" +
                "android.widget.LinearLayout/android.webkit.WebView/" +
                "android.webkit.WebView/android.view.View" +
                "/android.view.View/android.view.View/android.view.View[3]/android.widget.EditText[1]"));
        WebElement passWd = driver.findElement(By.xpath("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout[2]/" +
                "android.widget.LinearLayout/android.webkit.WebView/" +
                "android.webkit.WebView/android.view.View" +
                "/android.view.View/android.view.View/android.view.View[3]/android.widget.EditText[2]"));
        WebElement loginBtn = driver.findElement(By.xpath("/hierarchy/android.widget.FrameLayout/android.widget" +
                ".LinearLayout/android.widget.FrameLayout[2]/android.widget.LinearLayout/" +
                "android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View/" +
                "android.view.View/android.view.View[3]/android.widget.Button"));

        uName.sendKeys("testbeddev4");
        passWd.sendKeys("Testbeddev4!");
        loginBtn.click();
        System.out.println("Logged in Successfully");

        driver.manage().timeouts().implicitlyWait(50, TimeUnit.SECONDS);
        Thread.sleep(9000);

        try {
            WebElement addTemp = driver.findElement(By.xpath("//android.widget.Button[@text='+']"));
            addTemp.click();
            System.out.println("Added temp");


        } catch (Exception e) {
            System.out.println("Add Temp Button not found");
        }

        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);


        try {
            WebElement setTemp = driver.findElement(By.xpath("//android.widget.Button[@text='Set temperature']"));
            setTemp.click();
            System.out.println("Set Temp button found");


        } catch (Exception e) {
            System.out.println("Device is off");
        }
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
    }

   // public void tearDown() throws Exception {

    //  driver.quit();
   // }

}





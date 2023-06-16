import org.openqa.selenium.*;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.Test;
import main.base;

import java.util.concurrent.TimeUnit;


public class TestDeviceOne extends base{

    @Test
    public void login() throws InterruptedException {
        try {
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

            uName.sendKeys("testbeddev3");
            passWd.sendKeys("Testbeddev3!");
            loginBtn.click();
            System.out.println("Logged in Successfully");

            driver.manage().timeouts().implicitlyWait(50, TimeUnit.SECONDS);
        }catch(Exception e){
            System.out.println("Some elements were not found on homepage");
        }
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
    @AfterMethod
    public void tearDown(){
        driver.quit();
    }


    }




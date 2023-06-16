import org.openqa.selenium.*;
import org.testng.Assert;
import org.testng.annotations.Test;
import main.base;
import java.net.MalformedURLException;


public class TestDeviceTwo extends base {

    public boolean isElementDisplayed(WebElement element) {
        try {
            return element.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    //@Test
    public void addTempCheck() throws InterruptedException, MalformedURLException {

        Thread.sleep(9000);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//input[@type='email']"))),
                true);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//input[@type='password']"))),
                true);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[@class='login-btn-style" +
                " white-text-color block cursor-pointer text-center']"))), true);
        home.loginDeviceTwo();
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[contains(text(),'+')]"))),
                true);
        try {
            Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[contains(text()," +
                    "'Set temperature')]"))), true);
            home.addTemp();
        } catch (Exception e) {
            System.out.println("Device is off");
            driver.quit();
        }
        //home.addTemp();

    }


}


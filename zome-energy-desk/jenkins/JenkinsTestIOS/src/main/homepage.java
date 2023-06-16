import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.*;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.testng.Assert;
import java.net.MalformedURLException;
import java.time.Duration;


public class homepage {

    public AppiumDriver driver;
    @FindBy(xpath = "//input[@type='email']")
    public WebElement uName;

    @FindBy(xpath = "//input[@type='password']")
    public WebElement passWd;

    @FindBy(xpath = "//button[@class='login-btn-style white-text-color block cursor-pointer text-center']")
    public WebElement loginBtn;

    @FindBy(xpath = "//button[contains(text(),'+')]")
    public WebElement addTemp;

    @FindBy(xpath = "//button[contains(text(),'Set temperature')]")
    public WebElement setTemp;

    @FindBy(xpath = "//span[@aria-label='close']//*[name()='svg']")
    public WebElement closeWindow;

    @FindBy(xpath = "/html[1]/body[1]/div[1]/main[1]/div[1]/header[1]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/span[1]/span[1]/*[name()='svg'][1]")
    public WebElement profile;

    @FindBy(xpath = "//span[contains(text(),'Logout')]")
    public WebElement logoutBtn;


    public homepage(AppiumDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);

    }


    public void waitTime(int sec, int mills) throws InterruptedException {
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(sec));
        Thread.sleep(mills);
    }


    public void loginDevice(String user, String password) throws InterruptedException, MalformedURLException {

        //Assert.assertEquals(true, uName.isDisplayed());
        Assert.assertEquals(true, passWd.isDisplayed());
        Assert.assertEquals(true, loginBtn.isDisplayed());
        System.out.println("found uname");
        uName.sendKeys(user);
        passWd.sendKeys(password);
        loginBtn.click();
        System.out.println("Login button clicked");
        waitTime(50, 9000);
    }

    public void loginDeviceTwo() throws InterruptedException, MalformedURLException {

        //Assert.assertEquals(true, uName.isDisplayed());
        Assert.assertEquals(true, passWd.isDisplayed());
        Assert.assertEquals(true, loginBtn.isDisplayed());
        System.out.println("found uname");
        uName.sendKeys("testbeddev5");
        passWd.sendKeys("Testbeddev5!");
        loginBtn.click();
        System.out.println("Login button clicked");
        waitTime(50, 9000);
    }

    public void addTemp() throws InterruptedException {
        waitTime(20, 5000);
        addTemp.click();
        System.out.println("found add temp button and added temp");
        waitTime(10, 3000);

        try {
            setTemp.click();
            System.out.println("Set Temp button found");
        } catch (Exception e) {
            System.out.println("Device is off");

        }
        waitTime(20, 0);
        //driver.quit();

    }

    public void logout() throws InterruptedException {
        closeWindow.click();
        driver.navigate().refresh();
        waitTime(30, 9000);
        closeWindow.click();
        waitTime(30, 9000);
        profile.click();
        waitTime(10, 9000);
        logoutBtn.click();
        waitTime(10, 3000);

    }


}
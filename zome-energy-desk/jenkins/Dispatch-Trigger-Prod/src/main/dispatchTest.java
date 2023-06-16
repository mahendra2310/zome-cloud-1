import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;
import java.util.concurrent.TimeUnit;



public class dispatchTest {
    public static WebDriver driver;
    String baseUrl;
    public static homepage home;
    public dispatchPage dispatch;

    public boolean isElementDisplayed(WebElement element) {
        try {
            return element.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    @BeforeTest
    public void setUp() throws Exception {


        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("window-size=1920,1080");
        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--ignore-certificate-errors");
        options.addArguments("--remote-allow-origins=*");


        driver = new ChromeDriver(options);

        driver.get("https://app.zomepower.com");
        driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
        driver.manage().window().fullscreen();
        home = new homepage(driver);
        dispatch = new dispatchPage(driver);


    }

    @Test
    public void addTempCheck() throws Exception {
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//input[@type='email']"))),
                true);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//input[@type='password']"))),
                true);
        Assert.assertEquals(isElementDisplayed(driver.findElement(By.xpath("//button[@class='login-btn-style" +
                " white-text-color block cursor-pointer text-center']"))), true);
        home.loginDevice("zome_analyst", "SKa98n#D");
        Thread.sleep(5000);

        dispatch.sendDispatch();
    }

}


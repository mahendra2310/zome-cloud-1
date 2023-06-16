
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.*;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import java.awt.*;
import java.awt.event.KeyEvent;
import java.io.File;
import java.time.Duration;


public class dispatchPage {
    public static void waitTime(int sec) throws InterruptedException {

        Thread.sleep(sec);
    }

    static WebDriver driver;
    @FindBy(xpath = "(//div[@class='svg-icon'])[9]")
    static
    WebElement btnAdmintrationIcon;

    @FindBy(xpath = "//td[normalize-space()='TESTBED-PROD']/preceding-sibling::td[1]/label[1]/span[1]/input[1]")
    static
    WebElement ProdCheck;


    @FindBy(xpath = "//span[@aria-label='right']")
    static
    WebElement btnNextButton;

    @FindBy(xpath = "//button[@class='gateway-btn-style-admin" +
            " white-text-color block cursor-pointer text-center content-end']")
    static
    WebElement dispatchEventBtn;

    @FindBy(xpath = "//a[normalize-space()='5']")
    static
    WebElement dispatchFifithPage;

    @FindBy(xpath = "//div[@class='p-7']//div//thead[@class='ant-table-thead']//input[@type='checkbox']")
    static
    WebElement selectAllDev;

    @FindBy(xpath = "//span[normalize-space()='Next']")
    static
    WebElement next;

    @FindBy(xpath = "//div[@class='p-7']//div//li[@title='Next Page']//button[@type='button']")
    static
    WebElement dispatchNext;


    @FindBy(xpath = "//span[normalize-space()='+']")
    static
    WebElement addTemp;

    @FindBy(xpath = "//div[contains(@class,'ant-picker-dropdown ant-picker-dropdown-placement-bottomLeft')]//ul[1]//li[1]//div[1]")
    static
    WebElement timeValue;

    @FindBy(xpath = "//button[@class='doneBtnStyle']")
    static
    WebElement confirmBtn;

    @FindBy(xpath = "//button[contains(@class,'doneBtnStyle')]")
    static
    WebElement setpointBtn;

    @FindBy(xpath = "//button[@class='remove-btn-style white-text-color cursor-pointer ']\n")
    static
    WebElement cont;


    //button[@class='remove-btn-style white-text-color cursor-pointer ']
    @FindBy(xpath = "//span[normalize-space()='Ok']")
    static
    WebElement confirmTime;

    @FindBy(xpath = "//input[@placeholder='Hour | Min']")
    static
    WebElement timeVal;

    @FindBy(xpath = "//li[@class='ant-pagination-item ant-pagination-item-3']//a[@rel='nofollow'][normalize-space()='3']\n")
    static
    WebElement thirdPage;

    //li[@class='ant-pagination-item ant-pagination-item-3']//a[@rel='nofollow'][normalize-space()='3']
    static boolean elementFound = false;


    public dispatchPage(WebDriver driver) throws AWTException {
        dispatchPage.driver = driver;
        PageFactory.initElements(driver, this);
    }


    public static void sendDispatch() throws Exception {
        btnAdmintrationIcon.click();
        waitTime(3000);
        System.out.println("click admin button");

        thirdPage.click();
        ProdCheck.click();
        //checkElement(ProdCheck);
        waitTime(3000);
        dispatchEventBtn.click();
        System.out.println("click testbed-prod");

        //Utilities.waitTime(25);
        //dispatchFifithPage.click();
        waitTime(3000);
        selectAllDev.click();

        for (int i = 0; i < 5; i++) {
            dispatchNext.click();
            selectAllDev.click();
        }
        next.click();
        addTemp.click();
        System.out.println("added temp");
        Thread.sleep(9000);
        timeVal.sendKeys("00:15");
        Thread.sleep(4000);
        confirmTime.click();
        waitTime(5000);
        confirmBtn.click();
        waitTime(5000);

        setpointBtn.click();
        waitTime(3000);
        cont.click();
        waitTime(5000);
        driver.quit();
    }

    public static void checkElement(WebElement Prod) {
        while (!elementFound) {
            try {
                Prod.click();
                elementFound = true;
            } catch (Exception e) {
                btnNextButton.click();
            }
        }
    }
}


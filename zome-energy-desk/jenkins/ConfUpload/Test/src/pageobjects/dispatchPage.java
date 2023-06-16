package pageobjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import java.awt.*;
import java.awt.event.KeyEvent;
import hooks.Utilities;

public class dispatchPage {

    static WebDriver driver;
    Utilities utilities;
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

    @FindBy(xpath = "//input[@value='15']")
    static
    WebElement timeValue;

    @FindBy(xpath = "//button[@class='doneBtnStyle']")
    static
    WebElement confirmBtn;

    @FindBy(xpath = "//button[contains(@class,'doneBtnStyle')]")
    static
    WebElement setpointBtn;


    static boolean elementFound = false;


    public dispatchPage(WebDriver driver) throws AWTException {
        dispatchPage.driver = driver;
        utilities = new Utilities(driver);
        PageFactory.initElements(driver, this);
    }






    public static void sendDispatch() throws InterruptedException {
        btnAdmintrationIcon.click();
        Thread.sleep(3000);

        checkElement(ProdCheck);
        Utilities.waitTime(25);
        dispatchEventBtn.click();
        //Utilities.waitTime(25);
        //dispatchFifithPage.click();
        Utilities.waitTime(25);
        selectAllDev.click();

        for (int i = 0; i < 4; i++) {
            dispatchNext.click();
            selectAllDev.click();
        }
        next.click();
        addTemp.click();
        timeValue.click();
        Utilities.waitTime(25);
        confirmBtn.click();
        Utilities.waitTime(25);

        setpointBtn.click();
        Utilities.waitTime(25);
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
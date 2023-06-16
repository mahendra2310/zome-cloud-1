package pageobjects;

import org.openqa.selenium.*;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import hooks.Utilities;
import org.testng.Assert;


public class loginpage {

    WebDriver driver;
    Utilities utilities;


    @FindBy(xpath = "//input[@placeholder='Email or username']")
    WebElement email;
    
    @FindBy(xpath = "//input[@placeholder='Password']")
    WebElement password;

    @FindBy(xpath = "/html[1]/body[1]/div[1]/main[1]/div[1]/div[1]/div[1]/div[1]/nav[1]/ul[1]/li[4]/p[1]/div[1]")
    WebElement allPropBtn;

    @FindBy(xpath = "//td[normalize-space()='Virginia Oaks']")
    WebElement virginiaOaks;
    @FindBy(xpath = "/html[1]/body[1]/div[1]/main[1]/div[1]/div[1]/div[1]/main[1]/div[2]/div[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/label[1]/span[1]/input[1]")
    WebElement virginiaOaksCheck;

    @FindBy(xpath = "//input[@type='checkbox']")
    WebElement virginiaOaksChecks;

    @FindBy(xpath = "//button[@class='gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end']")
    WebElement showGatewaysBtn;

    @FindBy(xpath = "//button[normalize-space()='Virginia Oaks 1']")
    WebElement vOaks1;
    @FindBy(xpath = "//button[normalize-space()='Virginia Oaks 2']")
    WebElement vOaks2;

    @FindBy(xpath = "//button[normalize-space()='Virginia Oaks 3']")
    WebElement vOaks3;

    @FindBy(xpath = "//button[normalize-space()='Virginia Oaks 4']")
    WebElement vOaks4;


    @FindBy(xpath = "//button[@class='login-btn-style white-text-color block cursor-pointer text-center']")
    WebElement login;


    @FindBy(xpath = "/html[1]/body[1]/div[1]/main[1]/div[1]/div[1]/div[1]/main[1]/div[1]/div[1]/div[2]/div[3]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/table[1]/tbody[1]/tr[1]/td[8]/div[1]/div[2]/img[1]")
    WebElement tempBtn;

    @FindBy(xpath = "//button[@class='text-4xl font-weight-bold button']")
    WebElement addTemp;


    @FindBy(xpath = "//span[@aria-label='close']//*[name()='svg']")
    WebElement exitBtn;

    @FindBy(xpath = "//button[@class='gateway-btn-style white-text-color block cursor-pointer text-center mb-2 content-end ml-3']")
    WebElement addDevice;

    @FindBy(xpath = "/html[1]/body[1]/div[1]/main[1]/div[1]/div[1]/div[1]/div[1]/nav[1]/ul[1]/li[7]/p[1]/div[1]")
    WebElement users;
    @FindBy(xpath = "/html[1]/body[1]/div[1]/main[1]/div[1]/div[1]/div[1]/main[1]/div[2]/div[1]/div[2]/div[1]/span[1]/input[1]")
    WebElement propSelect;

    @FindBy(xpath = "//div[@class='ant-select-item-option-content'][normalize-space()='Whitley Luxury Apartments']")
    WebElement whitleyLuxury;

    @FindBy(xpath = "//button[contains(@class,'addUserbtn white-text-color block cursor-pointer text-center mt-5')]")
    WebElement showUsers;

    @FindBy(xpath = "//div[@class='ant-select-item-option-content'][normalize-space()='Virginia Oaks']")
    WebElement vOaksDropDown;
    @FindBy(xpath = "//span[normalize-space()='Add User']")
    WebElement addUser;

    @FindBy(xpath = "//span[normalize-space()='Upload csv']")
    WebElement uploadCsv;

    @FindBy(xpath = "//span[@aria-label='close']//*[name()='svg']")
    WebElement exitAdd;

    @FindBy(xpath = "/html[1]/body[1]/div[1]/main[1]/div[1]/div[1]/div[1]/div[1]/nav[1]/ul[1]/li[5]/p[1]/div[1]")
    WebElement vacancy;

    @FindBy(xpath = "//button[@class='gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end']")
    WebElement select;


    @FindBy(xpath = "/html[1]/body[1]/div[3]/div[1]/div[2]/div[1]/div[2]/div[2]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[1]/table[1]/tbody[1]/tr[2]/td[1]/label[1]/span[1]/input[1]")
    WebElement selectAll;


    @FindBy(xpath = "//span[normalize-space()='Schedule']")
    WebElement schedule;

    @FindBy(xpath = "//input[@placeholder='Select date']")
    WebElement date;

    @FindBy(xpath = "/html[1]/body[1]/div[1]/main[1]/div[1]/div[1]/div[1]/div[1]/nav[1]/ul[1]/li[10]/li[1]/div[1]/li[1]/p[1]/div[1]")
    WebElement adminBtn;
    @FindBy(xpath = "//tbody/tr[1]/td[1]/label[1]/span[1]/input[1]")
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


    @FindBy(xpath = "//button[normalize-space()='Pleasanton Business Office']")
    static
    WebElement demoGateway;

    public loginpage(WebDriver driver) {
        this.driver = driver;
        utilities = new Utilities(driver);
        PageFactory.initElements(driver, this);
    }

    public void logIntoApplication() throws InterruptedException {
        driver.manage().window().fullscreen();
        utilities.waitForElementToDisplay(email);
        utilities.waitForElementToDisplay(password);
        email.sendKeys("zome_analyst");
        password.sendKeys("SKa98n#D");
        login.click();
        Thread.sleep(9000);

    }



    public void properties() throws Exception {
        utilities.waitForElementToDisplay(allPropBtn);
        allPropBtn.click();
        System.out.println("clicked all props");
        Assert.assertEquals("Virginia Oaks",virginiaOaks.getText());
        Thread.sleep(4000);
        virginiaOaksCheck.click();
        Assert.assertTrue(showGatewaysBtn.isDisplayed());
        showGatewaysBtn.click();
        Assert.assertTrue(vOaks1.isDisplayed());
        Assert.assertTrue(vOaks2.isDisplayed());
        Assert.assertTrue(vOaks3.isDisplayed());
        Assert.assertTrue(vOaks4.isDisplayed());
        vOaks1.click();
        tempBtn.click();
        utilities.waitForElementToDisplay(addTemp);
        Assert.assertTrue(addTemp.isDisplayed());
        exitBtn.click();
        Assert.assertTrue(addDevice.isDisplayed());

    }

    public void users() throws InterruptedException {
        users.click();
        propSelect.click();
        Thread.sleep(5000);
        whitleyLuxury.click();
        showUsers.click();
        Thread.sleep(5000);
        Assert.assertTrue(addUser.isDisplayed());
        Assert.assertTrue(uploadCsv.isDisplayed());
        addUser.click();
        Thread.sleep(6000);
        exitAdd.click();
    }

    public void vacancy() throws InterruptedException {
        vacancy.click();
        utilities.waitForElementToDisplay(virginiaOaks);
        Assert.assertEquals("Virginia Oaks",virginiaOaks.getText());
        Thread.sleep(9000);
        virginiaOaksChecks.click();
        select.click();
        Thread.sleep(9000);
        //utilities.waitForElementToDisplay(selectAll);
        //selectAll.click();
        //Assert.assertTrue(schedule.isDisplayed());
        //schedule.click();
        //date.click();
        //exitAdd.click();
        driver.navigate().refresh();
        utilities.waitForElementToDisplay(adminBtn);


        adminBtn.click();
        thirdPage.click();
        driver.navigate().refresh();
        demoGateway.click();
        Assert.assertTrue(addDevice.isDisplayed());
        Thread.sleep(9000);
    }
}


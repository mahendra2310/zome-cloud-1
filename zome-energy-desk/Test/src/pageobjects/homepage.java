package pageobjects;

import java.time.Duration;
import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import hooks.Utilities;
import hooks.base;

public class homepage {

    WebDriver driver;
    Utilities utilities;
    public int thermoState;
    public int smartSwitch;

    @FindBy(xpath = "//button[contains(text(),'TESTBED-DEV')]")
    WebElement testBedStage;

    @FindBy(xpath = "(//tbody/tr/td[text()='Thermostat device']/following-sibling::td/descendant::img[2])")
    List<WebElement> temperature;

    @FindBy(xpath = "//button[text()='+']")
    WebElement addTemperatureButton;

    @FindBy(xpath = "//button[text()='-']")
    WebElement minusTemperatureButton;

    @FindBy(xpath = "//div/button[contains(@class,'temp-set-btn')]")
    WebElement setTemperatureButton;

    @FindBy(xpath = "//span[contains(text(),'Device temperature update successfully')]")
    public WebElement successMesssage;

    @FindBy(xpath = "(//span[contains(@class,'avatar')])[2]")
    public WebElement profile;

    @FindBy(xpath = "//span[contains(text(),'Logout')]")
    public WebElement logout;

    @FindBy(xpath = "//*[@data-icon='close']")
    public WebElement closeButton;

    @FindBy(xpath = "(//*[contains(@class,'temperature-display')]/descendant::p)[2]")
    public WebElement Temperarture;

    @FindBy(xpath = "(//tbody/tr/td[text()='Thermostat device']/preceding-sibling::td[1])")
    public List<WebElement> UpdatedTemp;

    @FindBy(xpath = "//tbody/tr/td[text()='Thermostat device']/following-sibling::td/descendant::img[2]")
    public List<WebElement> ThermostatDevice;

    @FindBy(xpath = "//tbody/tr[1]/td[text()='Smart switch']")
    public List<WebElement> Smartswitch;

    @FindBy(xpath = "//li[@title='Next Page'][@aria-disabled='false']")
    public WebElement NextButton;

    @FindBy(xpath = "//li[contains(@class,'pagination-item')]")
    public List<WebElement> Rows;

    @FindBy(xpath = "//th[text()='Device Name']")
    public WebElement DeviceName;

    @FindBy(xpath = "//span[contains(text(),'Home')]")
    public WebElement Home;

    @FindBy(xpath = "//label[@for='toggle2']")
    public WebElement Toggle;

    @FindBy(xpath = "//button[@aria-label='Close']")
    public WebElement CloseButton;

    public homepage(WebDriver driver) {
        this.driver = driver;
        PageFactory.initElements(driver, this);
        utilities = new Utilities(driver);
    }

    public void clickOnGateway(String gateway) {
        waitForElementToDisplay(testBedStage);
        driver.findElement(By.xpath("//button[contains(text(),'" + gateway + "')]")).click();
        waitForElementToDisplay(DeviceName);
    }

    public void minusTemperature(int index) throws InterruptedException {
        waitForElementToDisplay(temperature.get(index));
        temperature.get(index).click();
        waitForElementToDisplay(minusTemperatureButton);
        minusTemperatureButton.click();
        //Thread.sleep(3000);
    }

    public void addTemperature(int index) throws InterruptedException {

          waitForElementToDisplay(temperature.get(index));
          temperature.get(index).click();
          waitForElementToDisplay(addTemperatureButton);

        //closeButton.click();

                /*waitForElementToDisplay(temperature.get(index));
        temperature.get(index).click();
        Thread.sleep(6000);

        waitForElementToDisplay(addTemperatureButton);
                 */
        addTemperatureButton.click();
        //Thread.sleep(3000);

    }

    public void setTemperature() throws InterruptedException {
        //utilities.scrollDownUntilElementIsVisible(setTemperatureButton);
       // waitForElementToDisplay(setTemperatureButton);
        setTemperatureButton.click();
        //Thread.sleep(4000);
       // closeButton.click();
    }

    public void waitForElementToDisplay(WebElement element) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        wait.until(ExpectedConditions.visibilityOf(element));
    }

    public boolean isElementDisplayed(WebElement element) {
        try {
            return element.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void logout() {
        profile.click();
        waitForElementToDisplay(logout);
        logout.click();
    }

	/*public void GetThermostatAndSmartSwitchCount() {
		for (int i = 0; i < Rows.size(); i++) {
			thermoState = ThermostatDevice.size();
			smartSwitch = smartSwitch + Smartswitch.size();
			for (int j = 0; j < Smartswitch.size(); j++) {
				Smartswitch.get(j).click();
				try {
					Thread.sleep(2000);
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				Toggle.click();
				try {
					Thread.sleep(2000);
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				CloseButton.click();
			}
			try {
				NextButton.click();
			} catch (Exception e) {
				break;
			}
		*///}

    //}


}

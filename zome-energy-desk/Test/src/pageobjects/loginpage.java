package pageobjects;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import hooks.Utilities;
import hooks.base;

public class loginpage{

	 WebDriver driver;
	 Utilities utilities;
	  
	
	  @FindBy(xpath = "//input[@type='email']")
	  WebElement email;

	  
	  @FindBy(xpath = "//input[@type='password']")
	  WebElement password;
	  
	  @FindBy(xpath = "//button/span[contains(text(),'LOGIN')]")
	  WebElement login;


	    public loginpage(WebDriver driver){

	        this.driver = driver;
	        utilities=new Utilities(driver);
	        PageFactory.initElements(driver, this);
	    }
	    
	    public void logIntoApplication() {
	    	utilities.waitForElementToDisplay(email);
	    	email.sendKeys("zome_analyst");
	    	password.sendKeys("Test@123");
	    	login.click();
	    }
	    
	    

}

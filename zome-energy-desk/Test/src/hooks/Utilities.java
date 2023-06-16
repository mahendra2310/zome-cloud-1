package hooks;

import java.security.SecureRandom;
import java.time.Duration;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

public class Utilities {
	WebDriver driver;
	
	public Utilities(WebDriver driver) {
		this.driver = driver;
	}
	
	
	 public void waitForElementToDisplay(WebElement element) {
	    	WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
	    	wait.until(ExpectedConditions.visibilityOf(element));
	    }
	    
	  
	  public String numericStringGenerator(int stringLength) {
	        String numeric = "0123456789";
	        SecureRandom randomString = new SecureRandom();
	        String generatedString = "";

	        for (int i = 0; i < stringLength; i++) {
	            generatedString += numeric.charAt(randomString.nextInt(numeric.length()));
	        }
	        return generatedString;
	    }
	  
		public boolean isElementDisplayed(WebElement element) {
			try {
				return element.isDisplayed();
			} catch (Exception e) {
				return false;
			}
		}


		  // this is an overload method to accept Webelement as parameter
	    public void scrollDownUntilElementIsVisible(WebElement element) {
	        try {
	            JavascriptExecutor jse = (JavascriptExecutor) this.driver;
	            jse.executeScript("arguments[0].scrollIntoView(true);", element);
	        } catch (Throwable e) {
	            JavascriptExecutor jse = (JavascriptExecutor) this.driver;
	            jse.executeScript("arguments[0].scrollIntoView(true);", element);
	        }
	    }
	    
	    public void selectDropDownByIndex(WebElement ele,int index) {

	    	Select dropdown = new Select(ele);
	    	dropdown.selectByIndex(index);
	    }
}

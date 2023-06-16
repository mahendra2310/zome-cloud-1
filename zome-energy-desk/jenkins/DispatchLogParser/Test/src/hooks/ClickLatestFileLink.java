package hooks;


public class ClickLatestFileLink {
    public static parser parser;
    public static logDownload logDownload;
    public static unzip unzip;


    public static void main(String[] args) throws InterruptedException {
    parser = new parser();
    logDownload = new logDownload();
    logDownload.download();
    unzip.unzip();
    parser.parse();
    }




}


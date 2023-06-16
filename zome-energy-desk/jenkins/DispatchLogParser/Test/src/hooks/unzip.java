package hooks;

import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

import static hooks.ClickLatestFileLink.logDownload;
import static hooks.logDownload.maxTimestamp;

public class unzip {
    public static File tarFile;
    logDownload log = new logDownload();

    public static void unzip() {
        // Specify the path to the downloaded file
        tarFile = new File("/var/lib/jenkins/workspace/DispatchLogParser/syslogs_"+ maxTimestamp +".tar");
        System.out.println(tarFile);
        // Specify the path to the destination folder
        File destFolder = new File("/var/lib/jenkins/workspace/DispatchLogParser");

        try {
            // Create a TarArchiveInputStream to read the contents of the TAR file
            FileInputStream fis = new FileInputStream(tarFile);
            TarArchiveInputStream tis = new TarArchiveInputStream(fis);

            // Extract the contents of the TAR file to the destination folder
            TarArchiveEntry entry = tis.getNextTarEntry();
            System.out.println(entry);
            while (entry != null) {
                File newFile = new File(destFolder, entry.getName());

                // Create the parent directory if it doesn't exist
                if (!newFile.getParentFile().exists()) {
                    newFile.getParentFile().mkdirs();
                }

                // If the entry is a file, create the file in the destination folder and copy the contents
                if (!entry.isDirectory()) {
                    FileOutputStream fos = new FileOutputStream(newFile);
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = tis.read(buffer)) > 0) {
                        fos.write(buffer, 0, len);
                    }
                    fos.close();
                }

                entry = tis.getNextTarEntry();
            }

            tis.close();
            fis.close();
            String fileNameToSearch = "filetotransfer";

            System.out.println("TAR file was successfully extracted to " + destFolder.getAbsolutePath());
            File[] matchingFiles = destFolder.listFiles((dir, name) -> name.equals(fileNameToSearch));
            if (matchingFiles.length > 0) {
                System.out.println("Found the file: " + matchingFiles[0].getAbsolutePath());
            } else {
                System.out.println("Could not find the file: " + fileNameToSearch);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

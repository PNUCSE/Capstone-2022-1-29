public class Application {
	public boolean open(String fileName) {
		boolean canRead = false;
		// check whether the file can be read!
		if ( fileName.toUpperCase().endsWith(".doc") ) {
			canRead = checkDocFile(fileName);
		}
		else if ( fileName.toUpperCase().endsWith(".xls") ) {
			canRead = checkXlsFile(fileName);
		}
		
		if ( canRead == false ) return false;
		
		boolean result = false;
		// read and process the file
		if ( fileName.toUpperCase().endsWith(".doc") ) {
			result = processDoc(fileName);
		}
		else if ( fileName.toUpperCase().endsWith(".xls") ) {
			result = processXls(fileName);
		}
		return result;
	}

	private boolean processXls(String fileName) {
		return false;
	}
	private boolean processDoc(String fileName) {
		// �־��� file�� DOC ������ ������ ó����
		return false;
	}
	private boolean checkXlsFile(String fileName) {
		// �־��� file�� XLS ������ ������ ó����
		return false;
	}
	private boolean checkDocFile(String fileName) {
		// �־��� file�� DOC�� format���� Ȯ����
		return false;
	}
}

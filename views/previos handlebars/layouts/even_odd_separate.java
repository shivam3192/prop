public class even_odd_separate {

	public static int[] swap(int[]arr, int e, int o)
    {
        int temp;
        temp = arr[e];
        arr[e] = arr[o];
        arr[o] = temp;
        return arr;
    }

	public static void main(String[] args) {
		// TODO Auto-generated method stub

		int[] arr = new int[]{1,2,3,4,5,6,7,8,9,0};
		for(int k=0;k<arr.length;k++)
		{
			System.out.println(arr[k]);
		}

		int i = 0;
		int j = arr.length-1;
		while(i!=j)
		{
			if(arr[i]%2 == 0 && arr[j]%2 != 0)
				{
					i++;
					j--;
				}
			else
				{
					swap(arr, i, j);
					i++;
					j--;	
				}	
		}
		for(int k=0;k<arr.length;k++)
		{
			System.out.println(arr[k]);
		}
	}
}
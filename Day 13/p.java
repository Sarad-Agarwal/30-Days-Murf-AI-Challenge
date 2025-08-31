Scanner sc = new Scanner(System.in);
String str = sc.nextLine().toLowerCase();
boolean freq[]=new boolean[26];
ArrayList<Character> list = new ArrayList<>();
for(int i=0;i<str.length();i++){
    char ch = str.charAt(i);
    if(!freq[ch-'a']){
        list.add(ch);
        freq[ch-'a']=true;
    }
}
Collections.sort(list);
for(char ch:list){
    System.out.print(ch);
}
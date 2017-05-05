package main

import (
        "errors"
        "fmt"
        "strconv"
        "encoding/json"
        "github.com/hyperledger/fabric/core/chaincode/shim"
)
type CrowdFundChaincode struct {
}
type StudentInfo struct {

        	StudentRollNo string   `json:"studentrollno"`
       		StudentName string `json:"StudentName"`
       	        StudentMarksSem1 int   `json:"studentmarkssem1"`
		StudentMarksSem2 int   `json:"studentmarkssem2"`
		StudentMarksSem3 int   `json:"studentmarkssem3"`
		StudentMarksSem4 int   `json:"studentmarkssem4"`
		BadgeInfo 
}
	type BadgeInfo struct {
	
        BadgeName       string   `json:"Badgename"`
        BadgeUrl        string `json:"Badgeurl"`
        BadgeIssuedBy   string   `json:"Badgeissuedby"`
        BadgeIssuedTo   string `json:"Badgeissuedto"`
        //time 
}
func (t *CrowdFundChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
        var err error

        if len(args) != 2 {
                return nil, errors.New("Incorrect number of arguments. Expecting 2.")
        }

     if err!=nil {
                        return nil, err
                }
         record := StudentInfo{}
        record.StudentRollNo="12"
        record.StudentName = "assa"
        record.StudentMarksSem1 = 99;
		record.StudentMarksSem1 = 98;
		record.StudentMarksSem1 = 97;
		record.StudentMarksSem1 = 96;
        
	    newrecordByte, err := json.Marshal(record);
        if err!=nil {

            return nil, err
        }
                err=stub.PutState("default",newrecordByte);
         if err!=nil {
                        return nil, err
                }

        return nil, nil
}

func (t *CrowdFundChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
    if(function == "write") {
var account string

        var err error

        if len(args) != 6 {
                return nil, errors.New("Incorrect number of arguments. Expecting 2.")
        }
          account = args[0]

         recordByte, err := stub.GetState(account);
        fmt.Println(recordByte);
        if err != nil {

            return nil, err
        }
        record := StudentInfo{}
        if recordByte != nil {
        errrecordmarshal := json.Unmarshal(recordByte,&record);
        if errrecordmarshal != nil {
            return nil, errrecordmarshal
        }            
        }
        record.StudentRollNo   =args[0];
        record.StudentName     =args[1];
      
	  //var new1,new2,new3,new4 int ;
	     new1,err :=strconv.Atoi(args[2]);
		 record.StudentMarksSem1=new1;
		 new2,err:=strconv.Atoi(args[3]);
		record.StudentMarksSem2=new2;
		new3,err:=strconv.Atoi(args[4]);
		record.StudentMarksSem3=new3;
		new4,err:=strconv.Atoi(args[5]);
        record.StudentMarksSem4=new4;
		newrecordByte, err := json.Marshal(record);
        if err!=nil {

            return nil, err
        }
        err =stub.PutState(account,newrecordByte);
        if err != nil {

            return nil, err;
        } 
        return nil, nil
} else {
//this is update function
var account string
var err error
if len(args) != 1 {
                return nil, errors.New("Incorrect number of arguments. Expecting 1.")
        }

account = args[0]//got the roll no
          fmt.Printf(" key is : %s" , account)

recordByte, err := stub.GetState(account);
        fmt.Println(recordByte);
        if err != nil {

            return nil, err
        }
		record := StudentInfo{}
		if recordByte != nil {
        errrecordmarshal := json.Unmarshal(recordByte,&record);
        fmt.Printf(" the unmarshall function output is : %s" , errrecordmarshal)

        if errrecordmarshal != nil {
            return nil, errrecordmarshal
        }    
               
        }
        var avg,i1,i2,i3,i4 int;
		
		
			i1 =record.StudentMarksSem1;
			i2 =record.StudentMarksSem2;
			i3 =record.StudentMarksSem3;
			i4 =record.StudentMarksSem4 ;

avg = (i1+i2+i3+i4)/4;
		if((avg >=85) && (avg <100)) {
			    record.BadgeInfo.BadgeIssuedTo = record.StudentName;
                record.BadgeInfo.BadgeName = "MTech(IT)_IIIT_Bangalore_with_Division1";
                record.BadgeInfo.BadgeUrl = "http://localhost:3000/badge_image/div1.jpg";
                record.BadgeInfo.BadgeIssuedBy = "Dean";
                //record.badgeIssuedTo = "account";
            } else if((avg >= 60) && (avg < 85)) {
                record.BadgeInfo.BadgeIssuedTo = record.StudentName;
                record.BadgeInfo.BadgeName = "MTech(IT)_IIIT_Bangalore_with_Division2";
                record.BadgeInfo.BadgeUrl = "http://localhost:3000/badge_image/div2.jpg";
                record.BadgeInfo.BadgeIssuedBy = "Dean";
                //record.badgeIssuedTo = "account";
            } else if(avg < 60) {
                record.BadgeInfo.BadgeIssuedTo = record.StudentName;
                record.BadgeInfo.BadgeName = "MTech(IT)_IIIT_Bangalore_with_Division3";
                record.BadgeInfo.BadgeUrl = "http://localhost:3000/badge_image/div3.jpg";
                record.BadgeInfo.BadgeIssuedBy = "Dean";
                //record.badgeIssuedTo = "account";
            } 

 newrecordByte, err := json.Marshal(record);
        if err!=nil {

            return nil, err
        }
        err =stub.PutState(account,newrecordByte);
        if err != nil {

            return nil, err;
        } 
        return nil, nil


}
}
func (t *CrowdFundChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  if function != "read" {
                return nil, errors.New("Invalid query function name. Expecting \"query\".")
        }
        var err error

         if len(args) != 1 {
                return nil, errors.New("Incorrect number of arguments. Expecting name of the state variable to query.")
        }

     var   account = args[0]
        accountValueBytes ,err := stub.GetState(account)
        if err != nil {
                 return nil, err
        }
        return accountValueBytes, nil
}

func main() {
        err := shim.Start(new(CrowdFundChaincode))

        if err != nil {
                fmt.Printf("Error starting CrowdFundChaincode: %s", err)
        }
}


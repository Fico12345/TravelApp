import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "./AuthContext"; 
import DestinationsScreen from "./components/DestinationsScreen"; 
import ReservationsScreen from "./components/ReservationsScreen"; 
import ProfilScreen from "./components/ProfilScreen"; 
import LoginScreen from "./components/LoginScreen"; 
import Pocetna from "./components/Pocetna";

const Drawer = createDrawerNavigator();

export default Navigation = () =>  {
  const { isLoggedIn , logout} = useContext(AuthContext); 

  return (
    <NavigationContainer>
      <Drawer.Navigator>
        {isLoggedIn ? (
          <>
            {}
            <Drawer.Screen name="Pocetna" component={Pocetna}/>
            <Drawer.Screen name="Destinacije" component={DestinationsScreen} />
        
            <Drawer.Screen name="Rezervacije" component={ReservationsScreen} />
            <Drawer.Screen name="Profil" component={ProfilScreen} />
            <Drawer.Screen
              name="Odjava"
              component={() => null} 
              options={{
                drawerLabel: "Odjava",
                drawerIcon: () => null, 
              }}
              listeners={{
                drawerItemPress: () => {
                  logout(); 
                },
              }}
            />
           
          </>
        ) : (
          
          <Drawer.Screen name="Prijava" component={LoginScreen} />
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}





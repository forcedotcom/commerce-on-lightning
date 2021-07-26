@IsTest(SeeAllData=true)
public class NavigationItemsServiceTest {

    @IsTest
    public static void testGetConnectNavigationItems() {
        // Get a NavigationLinkSet with at least one Live Menu Item.
        List<NavigationMenuItem> existingLiveMenuItem = [
                SELECT Id, NavigationLinkSet.NetworkId, NavigationLinkSet.DeveloperName
                FROM NavigationMenuItem
                WHERE Status = 'Live'
                LIMIT 1
        ];

        System.assertNotEquals(0, existingLiveMenuItem.size());
        ConnectApi.NavigationMenuItemCollection navItemsResponse;
		NavigationMenuItem existingMenuItem = existingLiveMenuItem[0];
            
        Test.startTest();
        navItemsResponse = NavigationItemsService.getConnectNavigationItems(existingMenuItem.NavigationLinkSet.NetworkId, existingMenuItem.NavigationLinkSet.DeveloperName, true);
        Test.stopTest();

        System.assertNotEquals(null, navItemsResponse);
        System.assertNotEquals(null, navItemsResponse.menuItems);
        System.assertNotEquals(0, navItemsResponse.menuItems.size());
    }
}
public with sharing class NavigationItemsService {
    @AuraEnabled(Cacheable=true)
    public static ConnectApi.NavigationMenuItemCollection getConnectNavigationItems(String communityId, String navigationLinkSetDeveloperName, Boolean showHomeLink) {
        return ConnectApi.NavigationMenu.getCommunityNavigationMenu(
                communityId
                , null
                , navigationLinkSetDeveloperName
                , ConnectApi.PublishStatus.Live
                , false
                , showHomeLink
                , null);
    }
}
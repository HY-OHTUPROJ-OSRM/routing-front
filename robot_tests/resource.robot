*** Settings ***
Library    SeleniumLibrary
Library    Collections
Suite Setup  Set Selenium Timeout  30 seconds
*** Variables ***
${URL}    http://localhost:3006


*** Keywords ***
Open Browser Helper
    Set Selenium Speed   0.1s
    Open Browser   ${URL}    chrome
    Maximize Browser Window

Set Form
    [Arguments]    ${name}    ${type}    ${effect_value}    @{coordinates}
    Click Element    id=openadd
    Sleep    2s
    Input Text    id=name    ${name}
    Select From List By Value    id=type    ${type}
    Run Keyword If    '${type}' != 'roadblock'    Input Text    id=effectValue    ${effect_value}
    ${index}=    Set Variable    1
    ${i}=    Set Variable    0
    FOR    ${j}    IN RANGE    0      4
        ${lat}=     Get From List    ${coordinates}    ${i}
        ${i}=    Evaluate    ${i} + 1
        ${long}=       Get From List    ${coordinates}    ${i}
        ${lat}=   Convert To Number    ${lat}
        ${long}=   Convert To Number    ${long}
        Input Text    xpath=//div[@class="coordinate-group"][${index}]//input[@name="lat"]      ${lat}
        Input Text    xpath=//div[@class="coordinate-group"][${index}]//input[@name="long"]    ${long}
        ${index}=    Evaluate    ${index} + 1
        ${i}=    Evaluate    ${i} + 1
        Run Keyword Unless    ${j} == 3    Click Button    //button[text()='Add Coordinate']
    END
    Sleep   1s
    Click Button    //button[text()='Submit']
    Click Element    id=openadd
    Wait Until Page Contains    created successfully    timeout=300 seconds
    

Set Route
    [Arguments]    ${expected_distance}    @{coordinates}
    ${index}=    Set Variable    1
    ${i}=    Set Variable    0
    FOR    ${j}    IN RANGE    0       2
        ${lat}=    Get From List    ${coordinates}    ${i}
        ${i}=    Evaluate    ${i} + 1
        ${long}=    Get From List    ${coordinates}    ${i}
        Input Text    xpath=//div[@class="form-group"][${index}]//input[@name="lat"]     ${lat}
        Input Text    xpath=//div[@class="form-group"][${index}]//input[@name="long"]      ${long}
        ${index}=    Evaluate    ${index} + 1
        ${i}=    Evaluate    ${i} + 1
    END
    Sleep   2s
    Click Button    //button[text()='Route']
    Wait Until Page Contains    Primary Route    timeout=300 seconds
    ${distance}=    Get Text    xpath=//p[@id='distval']
    
    Should Be Equal    ${distance}    ${expected_distance}

Delete Added Polygon
    Click Element    id=openlist
    Sleep   2s
    Click Element    id=del0
    

    Wait Until Page Contains    deleted successfully    timeout=300 seconds
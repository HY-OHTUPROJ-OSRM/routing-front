*** Settings ***
Library    SeleniumLibrary
Library    Collections
resource   resource.robot
*** Variables ***
${URL}    http://localhost:3006

@{START_POSITION}    | 60.202980737099324 | 24.966698987834064
@{DESTINATION}       | 60.20366309673499  | 24.962911638037767

${NAME ONE}          Katkennut Väylä
${NAME TWO}          Katkennut Väylä
${TYPE}              roadblock
${EFFECT_VALUE}      1
${DistOne}      Distance: 0.93 km
${DistTwo}      Distance: 1.85 km
@{COORDINATES}          60.202980737099324     24.966698987834064      60.20366309673499       24.962911638037767
@{firstCOORDINATES}   60.205092   24.964304    60.205443    24.965248   60.205039    24.965978   60.204676    24.965098
@{secondCOORDINATES}   60.208649   24.966827   60.208446   24.967192    60.208665    24.967675    60.208840    24.967192

*** Test Cases ***

Set Route Test 0
    Open Browser Helper
    Set Route    ${DistOne}    @{COORDINATES}
    [Teardown]    Close Browser

Create Polygon Test
    Open Browser Helper
    Set Form    ${NAME ONE}    ${TYPE}    ${EFFECT_VALUE}    @{FIRSTCOORDINATES}
    [Teardown]    Close Browser

Set Route Test After Adding Polygon
    Open Browser Helper
    Set Route    ${DistTwo}    @{COORDINATES}
    [Teardown]    Close Browser

Test Delete Polygon
    Open Browser Helper
    Delete Added Polygon
    [Teardown]    Close Browser

Set Route Test After Delete
    Open Browser Helper
    Set Route    ${DistOne}    @{COORDINATES}
    [Teardown]    Close Browser
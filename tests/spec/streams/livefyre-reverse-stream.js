define([
    'streamhub-sdk/jquery',
    'jasmine',
    'streamhub-sdk/streams/livefyre-reverse-stream',
    'streamhub-sdk/clients/livefyre-bootstrap-client',
    'jasmine-jquery'],
function ($, jasmine, LivefyreReverseStream, LivefyreBootstrapClient) {
    describe('A LivefyreReverseStream', function () {
        var stream, opts, spy, mockData;

        beforeEach(function () {
            mockData = {"content": [{"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Kaepernick takes off running for a 49ers touchdown!</p><em>{\"eventType\":\"sanfran\",\"eventImportant\":false,\"_\":1360283811818}</em>", "id": "26382469", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283812, "annotations": {"moderator": true}, "createdAt": 1360283812}, "vis": 1, "type": 0, "event": 1360283813031663, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"sf-touchdown\",\"eventImportant\":true,\"_\":1360283792121}</em>", "id": "26382468", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283793, "annotations": {"moderator": true}, "createdAt": 1360283793}, "vis": 1, "type": 0, "event": 1360283793258498, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>After the flag the Ravens take over with a 1st and 10 on their own 49\n</p><em>{\"eventType\":\"baltimore\",\"eventImportant\":false,\"_\":1360283730626}</em>", "id": "26382467", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283731, "annotations": {"moderator": true}, "createdAt": 1360283731}, "vis": 1, "type": 0, "event": 1360283731873821, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Unsportsmanlike Conduct - #55 on the 49ers</p><em>{\"eventType\":\"sanfran\",\"eventImportant\":false,\"_\":1360283711045}</em>", "id": "26382466", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283712, "annotations": {"moderator": true}, "createdAt": 1360283712}, "vis": 1, "type": 0, "event": 1360283712170340, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"flag\",\"eventImportant\":true,\"_\":1360283695750}</em>", "id": "26382465", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283697, "annotations": {"moderator": true}, "createdAt": 1360283696}, "vis": 1, "type": 0, "event": 1360283697743105, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>After the TV timeout, the Ravens run the ball to the side for a sort gain \n</p><em>{\"eventType\":\"baltimore\",\"eventImportant\":false,\"_\":1360283687345}</em>", "id": "26382464", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283688, "annotations": {"moderator": true}, "createdAt": 1360283688}, "vis": 1, "type": 0, "event": 1360283688478341, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>FyrePoll: Who Wins Super Bowl 47? Vote now <a href=\"http://bit.ly/11p5Dpg\" target=\"_blank\" rel=\"nofollow\">http://bit.ly/11p5Dpg</a></p><em>{\"eventType\":\"blank\",\"eventImportant\":false,\"_\":1360283664418}</em>", "id": "26382463", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283665, "annotations": {"moderator": true}, "createdAt": 1360283665}, "vis": 1, "type": 0, "event": 1360283665584310, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"twominute\",\"eventImportant\":true,\"_\":1360283652091}</em>", "id": "26382462", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283653, "annotations": {"moderator": true}, "createdAt": 1360283653}, "vis": 1, "type": 0, "event": 1360283653213877, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Flacco snaps the ball just before the two minute mark, incomplete to Boldin\n</p><em>{\"eventType\":\"baltimore\",\"eventImportant\":false,\"_\":1360283649028}</em>", "id": "26382461", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283650, "annotations": {"moderator": true}, "createdAt": 1360283650}, "vis": 1, "type": 0, "event": 1360283650143458, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Rice takes the kick at the 1 yard line and returns to about the 20 for a gain of 19. </p><em>{\"eventType\":\"baltimore\",\"eventImportant\":false,\"_\":1360283624465}</em>", "id": "26382460", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283625, "annotations": {"moderator": true}, "createdAt": 1360283625}, "vis": 1, "type": 0, "event": 1360283625622513, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"kickoff\",\"eventImportant\":true,\"_\":1360283602725}</em>", "id": "26382459", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283603, "annotations": {"moderator": true}, "createdAt": 1360283603}, "vis": 1, "type": 0, "event": 1360283603879091, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>The officials rule that Kaepernick was in play when he scored, touchdown stands!\n</p><em>{\"eventType\":\"sanfran\",\"eventImportant\":false,\"_\":1360283596502}</em>", "id": "26382458", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283597, "annotations": {"moderator": true}, "createdAt": 1360283597}, "vis": 1, "type": 0, "event": 1360283597809269, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"challenge\",\"eventImportant\":true,\"_\":1360283560457}</em>", "id": "26382456", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283561, "annotations": {"moderator": true}, "createdAt": 1360283561}, "vis": 1, "type": 0, "event": 1360283561612753, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>That play caps off a 55 yard drive by the niners...but first the ravens challenge the play</p><em>{\"eventType\":\"sanfran\",\"eventImportant\":false,\"_\":1360283558163}</em>", "id": "26382455", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283559, "annotations": {"moderator": true}, "createdAt": 1360283559}, "vis": 1, "type": 0, "event": 1360283559299046, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Kaepernick takes off running for a 49ers touchdown</p><em>{\"eventType\":\"sanfran\",\"eventImportant\":false,\"_\":1360283529439}</em>", "id": "26382454", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283530, "annotations": {"moderator": true}, "createdAt": 1360283530}, "vis": 1, "type": 0, "event": 1360283530718884, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"sf-touchdown\",\"eventImportant\":true,\"_\":1360283517401}</em>", "id": "26382453", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283518, "annotations": {"moderator": true}, "createdAt": 1360283518}, "vis": 1, "type": 0, "event": 1360283518644273, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>This Super Bowl NewsHub is powered by Livefyre StreamHub <a href=\"http://bit.ly/11rEphW\" target=\"_blank\" rel=\"nofollow\">http://bit.ly/11rEphW</a></p><em>{\"eventType\":\"blank\",\"eventImportant\":false,\"_\":1360283491823}</em>", "id": "26382452", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283493, "annotations": {"moderator": true}, "createdAt": 1360283493}, "vis": 1, "type": 0, "event": 1360283493871823, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>#SB47</p><em>{\"eventType\":\"sanfran\",\"eventImportant\":false,\"_\":1360283387131}</em>", "id": "26382451", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360283389, "annotations": {"moderator": true}, "createdAt": 1360283388}, "vis": 1, "type": 0, "event": 1360283390872792, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>FyreFacts: John Elway of the Denver Broncos was the first quarterback to start five Super Bowls</p><em>{\"eventType\":\"blank\",\"eventImportant\":false,\"_\":1360004219205}</em>", "id": "26379160", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360004218, "annotations": {"moderator": true}, "createdAt": 1360004218}, "vis": 1, "type": 0, "event": 1360004218721974, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>FyreFacts: The price of a 30-second commercial for Super Bowl I in 1967 was $42,000</p><em>{\"eventType\":\"blank\",\"eventImportant\":false,\"_\":1360004181283}</em>", "id": "26379159", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1360004181, "annotations": {"moderator": true}, "createdAt": 1360004180}, "vis": 1, "type": 0, "event": 1360004181160258, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"kickoff\",\"eventImportant\":true,\"_\":1359868084083}</em>", "id": "26379057", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359868084, "annotations": {"moderator": true}, "createdAt": 1359868084}, "vis": 1, "type": 0, "event": 1359868084848703, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"firstdown\",\"eventImportant\":true,\"_\":1359867734011}</em>", "id": "26379056", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359867734, "annotations": {"moderator": true}, "createdAt": 1359867734}, "vis": 1, "type": 0, "event": 1359867734564738, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"challenge\",\"eventImportant\":true,\"_\":1359867728519}</em>", "id": "26379055", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359867729, "annotations": {"moderator": true}, "createdAt": 1359867728}, "vis": 1, "type": 0, "event": 1359867729038217, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"flag\",\"eventImportant\":true,\"_\":1359867721033}</em>", "id": "26379054", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359867721, "annotations": {"moderator": true}, "createdAt": 1359867721}, "vis": 1, "type": 0, "event": 1359867721847343, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>msgLengthCountdow nms gLengthCountdownmsgLengthCount downmsgLengthCountdownms gLengthCountdown asdff</p><em>{\"eventType\":\"blank\",\"eventImportant\":false,\"_\":1359866293712}</em>", "id": "26379053", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359866294, "annotations": {"moderator": true}, "createdAt": 1359866294}, "vis": 1, "type": 0, "event": 1359866294560252, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>1234567890123456789012345678901 1234567890123456789012345678901 1234567890123456789012345678901</p><em>{\"eventType\":\"blank\",\"eventImportant\":true,\"_\":1359865962973}</em>", "id": "26379052", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359865963, "annotations": {"moderator": true}, "createdAt": 1359865963}, "vis": 1, "type": 0, "event": 1359865963599420, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>123456789012345678901234567890</p><em>{\"eventType\":\"blank\",\"eventImportant\":true,\"_\":1359865937150}</em>", "id": "26379051", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359865937, "annotations": {"moderator": true}, "createdAt": 1359865937}, "vis": 1, "type": 0, "event": 1359865937818290, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>123456789012345678901234567890 123456789012345678901234567890 123456789012345678901234567890</p><em>{\"eventType\":\"blank\",\"eventImportant\":true,\"_\":1359865930566}</em>", "id": "26379050", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359865931, "annotations": {"moderator": true}, "createdAt": 1359865931}, "vis": 1, "type": 0, "event": 1359865931235842, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890</p><em>{\"eventType\":\"blank\",\"eventImportant\":true,\"_\":1359865870373}</em>", "id": "26379049", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359865871, "annotations": {"moderator": true}, "createdAt": 1359865871}, "vis": 1, "type": 0, "event": 1359865871175368, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>oops timeline message</p><em>{\"eventType\":\"blank\",\"eventImportant\":true,\"_\":1359865634554}</em>", "id": "26379048", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359865635, "annotations": {"moderator": true}, "createdAt": 1359865635}, "vis": 1, "type": 0, "event": 1359865635157270, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>timeline message</p><em>{\"eventType\":\"blank\",\"eventImportant\":false,\"_\":1359865625680}</em>", "id": "26379047", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359865626, "annotations": {"moderator": true}, "createdAt": 1359865626}, "vis": 1, "type": 0, "event": 1359865626292293, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>normal message</p><em>{\"eventType\":\"blank\",\"eventImportant\":false,\"_\":1359865619398}</em>", "id": "26379046", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359865620, "annotations": {"moderator": true}, "createdAt": 1359865620}, "vis": 1, "type": 0, "event": 1359865620431319, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"halftime\",\"eventImportant\":true,\"_\":1359855093214}</em>", "id": "26379045", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359855094, "annotations": {"moderator": true}, "createdAt": 1359855094}, "vis": 1, "type": 0, "event": 1359855094182774, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>test</p><em>{\"eventType\":\"baltimore\",\"eventImportant\":false,\"_\":1359855089873}</em>", "id": "26379044", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359855090, "annotations": {"moderator": true}, "createdAt": 1359855090}, "vis": 1, "type": 0, "event": 1359855090817284, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"endof2nd\",\"eventImportant\":true,\"_\":1359855084029}</em>", "id": "26379043", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359855084, "annotations": {"moderator": true}, "createdAt": 1359855084}, "vis": 1, "type": 0, "event": 1359855084974334, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"sf-touchdown\",\"eventImportant\":true,\"_\":1359855081117}</em>", "id": "26379042", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359855082, "annotations": {"moderator": true}, "createdAt": 1359855081}, "vis": 1, "type": 0, "event": 1359855082056004, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>test</p><em>{\"eventUrl\":\"<a href=\"http://nickcicero.files.wordpress.com/2013/02/screen-shot-2013-02-02-at-5-11-37-pm.png\" target=\"_blank\" rel=\"nofollow\">http://nickcicero.files.wordpress.com/2013/02/screen-shot-2013-02-02-at-5-11-37-pm.png</a>\",\"eventImportant\":false,\"_\":1359855028070}</em>", "id": "26379041", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359855029, "annotations": {"moderator": true}, "createdAt": 1359855028}, "vis": 1, "type": 0, "event": 1359855029035825, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>FyrePoll: Brats or Pizza? Vote now <a href=\"http://bit.ly/11rpZhO\" target=\"_blank\" rel=\"nofollow\">http://bit.ly/11rpZhO</a> </p><em>{\"eventUrl\":\"<a href=\"http://nickcicero.files.wordpress.com/2013/02/screen-shot-2013-02-02-at-5-11-37-pm.png\" target=\"_blank\" rel=\"nofollow\">http://nickcicero.files.wordpress.com/2013/02/screen-shot-2013-02-02-at-5-11-37-pm.png</a>\",\"eventImportant\":false,\"_\":1359855017619}</em>", "id": "26379040", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359855018, "annotations": {"moderator": true}, "createdAt": 1359855018}, "vis": 1, "type": 0, "event": 1359855018589509, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>FyrePoll: Brats or Pizza? Vote now <a href=\"http://bit.ly/11rpZhO\" target=\"_blank\" rel=\"nofollow\">http://bit.ly/11rpZhO</a> </p><em>{\"eventUrl\":\"<a href=\"http://nickcicero.files.wordpress.com/2013/02/screen-shot-2013-02-02-at-5-11-37-pm.png\" target=\"_blank\" rel=\"nofollow\">http://nickcicero.files.wordpress.com/2013/02/screen-shot-2013-02-02-at-5-11-37-pm.png</a>\",\"eventImportant\":false,\"_\":1359854996050}</em>", "id": "26379039", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359854997, "annotations": {"moderator": true}, "createdAt": 1359854997}, "vis": 1, "type": 0, "event": 1359854997295938, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"bal-touchdown\",\"eventImportant\":true,\"_\":1359853883148}</em>", "id": "26379038", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359853883, "annotations": {"moderator": true}, "createdAt": 1359853883}, "vis": 1, "type": 0, "event": 1359853883375745, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"sf-touchdown\",\"eventImportant\":true,\"_\":1359853864535}</em>", "id": "26379037", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359853864, "annotations": {"moderator": true}, "createdAt": 1359853864}, "vis": 1, "type": 0, "event": 1359853864929734, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Niners giving Flacco no looks in the endzone. He gets taken down for the 6th time today.</p><em>{\"eventType\":\"sanfran\",\"eventImportant\":false,\"_\":1359853738997}</em>", "id": "26379036", "authorId": "user_0@labs-t402.fyre.co", "updatedAt": 1359853739, "annotations": {"whitelist": true}, "createdAt": 1359853739}, "vis": 1, "type": 0, "event": 1359853739479500, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Big pass to Pitta - 1st and goal ravens</p><em>{\"eventType\":\"baltimore\",\"eventImportant\":false,\"_\":1359853682914}</em>", "id": "26379035", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359853683, "annotations": {"moderator": true}, "createdAt": 1359853683}, "vis": 1, "type": 0, "event": 1359853683116120, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>FyrePoll: Wings or Nachos? Vote now <a href=\"http://bit.ly/WGsHRf\" target=\"_blank\" rel=\"nofollow\">http://bit.ly/WGsHRf</a></p><em>{\"eventUrl\":\"<a href=\"http://www.ledr.com/colours/black.jpg\" target=\"_blank\" rel=\"nofollow\">http://www.ledr.com/colours/black.jpg</a>\",\"eventImportant\":false,\"_\":1359853661090}</em>", "id": "26379034", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359853661, "annotations": {"moderator": true}, "createdAt": 1359853661}, "vis": 1, "type": 0, "event": 1359853661312270, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p></p><em>{\"eventType\":\"twominute\",\"eventImportant\":true,\"_\":1359853641893}</em>", "id": "26379033", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359853642, "annotations": {"moderator": true}, "createdAt": 1359853641}, "vis": 1, "type": 0, "event": 1359853642108195, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Livefyre: We Make Your Site Social sales@livefyre.com to learn more</p><em>{\"eventUrl\":\"<a href=\"http://www.ledr.com/colours/black.jpg\" target=\"_blank\" rel=\"nofollow\">http://www.ledr.com/colours/black.jpg</a>\",\"eventImportant\":false,\"_\":1359853636004}</em>", "id": "26379032", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359853636, "annotations": {"moderator": true}, "createdAt": 1359853636}, "vis": 1, "type": 0, "event": 1359853636192936, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>The Ravens throwing game has been out of sync all day. That looked a bit better.</p><em>{\"eventType\":\"baltimore\",\"eventImportant\":false,\"_\":1359853620304}</em>", "id": "26379031", "authorId": "user_0@labs-t402.fyre.co", "updatedAt": 1359853620, "annotations": {"whitelist": true}, "createdAt": 1359853620}, "vis": 1, "type": 0, "event": 1359853620639667, "childContent": []}, {"source": 5, "content": {"replaces": "", "parentId": "", "bodyHtml": "<p>Big reception by torrey smith - 1st and 10 on the 35 yard line</p><em>{\"eventType\":\"baltimore\",\"eventImportant\":false,\"_\":1359853608369}</em>", "id": "26379030", "authorId": "system@labs-t402.fyre.co", "updatedAt": 1359853608, "annotations": {"moderator": true}, "createdAt": 1359853608}, "vis": 1, "type": 0, "event": 1359853608605367, "childContent": []}], "meta": {"last": 1360283812, "idx": 4, "first": 1359853608}, "authors": {"user_0@labs-t402.fyre.co": {"displayName": "User 0", "tags": [], "sourceId": "", "profileUrl": "", "avatar": "http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg", "type": 1, "id": "user_0@labs-t402.fyre.co"}, "system@labs-t402.fyre.co": {"displayName": "system", "tags": [], "sourceId": "", "profileUrl": "", "avatar": "http://gravatar.com/avatar/e23293c6dfc25b86762b045336233add/?s=50&d=http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg", "type": 1, "id": "system@labs-t402.fyre.co"}}};
        });

        describe("when constructed without a .headDocument", function () {
            beforeEach(function() {
                opts = {
                    "network": "labs-t402.fyre.co",
                    "siteId": "303827",
                    "articleId": "gene_publish_0",
                    "environment": "t402.livefyre.com",
                    "page": 4
                };
                spy = spyOn(LivefyreBootstrapClient, "getContent").andCallFake(function(opts, fn) {
                    fn(null, mockData);
                });

                stream = new LivefyreReverseStream(opts);
                stream._push = jasmine.createSpy();
                stream._endRead = jasmine.createSpy();
            });

            it ("should getContent() from LivefyreBootstrapClient when _read() is called", function () {
                stream._read();

                waitsFor(function() {
                    return stream._endRead.callCount > 0;
                });
                runs(function() {
                    expect(spy).toHaveBeenCalled();
                    expect(stream._endRead).toHaveBeenCalled();
                    expect(stream._endRead.callCount).toBe(1);
                    expect(stream._push).toHaveBeenCalled();
                    expect(stream._push.callCount).toBe(48);
                });
            });

            it ("should not emit content from states that are not visible", function () {
                var nonVisState = {
                    erefs: ["PF48kezy4YAeCjXtsYv379JcxaqFjgt1J0n89+ixAF26p+hMnmyimWdVuE6oofxWzXmoQYdFsBZ3+1IpUXEh+C5tPkcyZbDTRzYgPgU1ZN/0OdbNJpw="],
                    source: 1,
                    content: {
                        replaces: "",
                        id: "tweet-351026197783785472@twitter.com",
                        createdAt: 1372526142,
                        parentId: ""
                    },
                    vis: 2,
                    type: 0,
                    event: 1372526143230762,
                    childContent: []
                };

                mockData.content = [nonVisState];
                stream._read();

                waitsFor(function() {
                    return stream._endRead.callCount > 0;
                });
                runs(function() {
                    expect(stream._push.callCount).toBe(0);
                });
            });
        });

        describe("when constructed with opts.headDocument", function () {
            var stream;
            beforeEach(function () {
                stream = new LivefyreReverseStream({
                    "network": "labs-t402.fyre.co",
                    "siteId": "303827",
                    "articleId": "gene_publish_0",
                    "environment": "t402.livefyre.com",
                    "page": 4,
                    "headDocument": mockData
                });
            });
            it("should set ._headDocumentContentIds on construction", function () {
                expect(stream._headDocumentContentIds.length > 0).toBe(true);
            });
            describe("on first start", function () {
                beforeEach(function () {
                    spyOn(LivefyreBootstrapClient, "getContent").andCallFake(function(opts, fn) {
                        fn(null, mockData);
                    });
                    spyOn(stream, '_push').andCallThrough();
                    spyOn(stream, '_endRead').andCallThrough();
                    stream.start();
                });
                it("should emit Content from headDocument on first start, and not use LivefyreBootstrapClient", function () {
                    expect(stream._pushedHeadDocument).toBe(true);
                    expect(LivefyreBootstrapClient.getContent).not.toHaveBeenCalled();
                    expect(stream._push).toHaveBeenCalled();
                });
                describe("and on subsequent start", function () {
                    var pushCallCountBeforeSecondStart;
                    beforeEach(function () {
                        pushCallCountBeforeSecondStart = stream._push.callCount;
                        stream.start();
                    });
                    it("calls LivefyreBootstrapClient for the first time", function () {
                        expect(LivefyreBootstrapClient.getContent.callCount).toBe(1);
                    });
                    it("does not ._push content that was already emitted from headDocument", function () {
                        // Because all requests to LivefyreBootstrapClient.getContent are returning the same response,
                        // The second start will return the same Content as in the headDocument, and nothing should be _pushed
                        expect(stream._push.callCount).toBe(pushCallCountBeforeSecondStart);
                    });
                });
            });
        });

        describe('when a plugin is added', function () {
            var stream,
                plugin,
                plaintextState = {"content":{"fields":{"body":{"type":"text/plain","value":"Some more text"},"type":{"type":null,"value":"text/plain"}},"updatedAt":1374182270,"createdAt":1374182270,"parentId":null,"id":"7095cb02-0902-4470-a8c5-f1d84a5b9fa1","ancestorId":null,"sortOrder":6.250000086552674e+22},"source":17,"type":4,"event":1374182270623258};
            beforeEach(function () {
                stream = new LivefyreReverseStream({
                    headDocument: { content: [plaintextState] }
                });
                plugin = jasmine.createSpy('stream plugin');
                stream.plugins.push(plugin);
            });
            it('has the plugin in .plugins', function () {
                expect(stream.plugins.indexOf(plugin)).not.toBe(-1);
            });
            it('tries to use the plugin to handle unknown states', function () {
                stream.start();
                expect(plugin).toHaveBeenCalled();
            });
            it('_pushes new content if the plugin returns something', function () {
                var result = {test: 1};
                spyOn(stream, '_push').andCallThrough();
                stream.plugins = [function () {
                    return result;
                }];
                stream.start();
                expect(stream._push).toHaveBeenCalledWith(result);
            });
            it('does not _push new content if the plugin returns falsy', function () {
                spyOn(stream, '_push').andCallThrough();
                stream.plugins = [function () {
                    return;
                }];
                stream.start();
                expect(stream._push).not.toHaveBeenCalled();
            });
            it('does not _push new content if the plugin throws', function () {
                spyOn(stream, '_push').andCallThrough();
                stream.plugins = [function () {
                    throw new Error();
                }];
                stream.start();
                expect(stream._push).not.toHaveBeenCalled();
            });
        });

    });
});
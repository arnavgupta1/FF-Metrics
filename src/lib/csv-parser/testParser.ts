import { MockoSheetParser } from './mockoSheetParser';

export async function testCSVParser() {
  try {
    console.log('Testing CSV Parser...');
    
    // For testing in Next.js environment, we'll use a sample CSV content
    // In production, this would be passed from the API route
    const sampleCSVContent = `MockoSheet Snake Draft v3.0 2025,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
Support my work at ko-fi.com/mosers15,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
"Snake | 10 Teams | 4 Pts Pass TD | QB/WR/RB Rushing: 6Pts/6Pts/6Pts | Receptions RB/WR/TE: 0Pts/0Pts/0Pts | SFLEX/2QB: NO | TEP: NO | IDP: NO | Updated: August 1, 2025",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
QB (10) / RB (23) / WR (27) / TE (11) DL (0) / DB (0) / LB (0) / K (10) / DST (10) / FLEX Total (1) / IDP FLEX Total (0),,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,QUARTERBACKS,,,,,,,,,,,,,,,,RUNNINGBACKS,,,,,,,,,,,,,,,,Wide Receivers,,,,,,,,,,,,,,,Top 100 Players,,,,,,,,,,
,,,Player,Tm/Bye,Pos Rank,ECR,Pos Tier,ADP,VAL-ADP,VAL F,VAL,VAL C,PS,DYN,Drafted,,,,Player,Tm/Bye,Pos Rank,ECR,Pos Tier,ADP,VAL-ADP,VAL F,VAL,VAL C,PS,DYN,Drafted,,,,Player,Tm/Bye,Pos Rank,ECR,Pos Tier,ADP,VAL-ADP,VAL F,VAL,VAL C,PS,DYN,Drafted,,,Player,Tm/Bye,Pos Rank,ECR,Pos Tier,ADP,VAL-ADP,VAL,DYN,OVR TIer,Helper
,4,,Josh Allen,BUF/7,1,1,QB1,3.03,+ 2.04,89,94,100,14%,332,,,1,,Saquon Barkley,PHI/9,1,1,RB1,1.04,+ 1.01,131,139,147,7%,375,,,3,,Ja'Marr Chase,CIN/10,1,1,WR1,1.01,= 1.01,107,113,120,6%,500,,,,Saquon Barkley,PHI/9,1,1,RB1,1.04,+ 1.01,139,375,1,
,,,DEFENSES,,,,,,,KICKERS,,,,,,,,,"HOW TO USE:
1. At your pick, find the players available with the highest VAL. VAL acts as a common unit across positions. Higher VAL indicates a better player for the format. Based on the ADP for your format, determine if that player is worth the pick: Check for tier drop offs, whether VAL-ADP is positive, and whether you can reach or wait. Practice your draft with mocks!

2. Check the Estimated Positive Positional Value Remaining By Round table to see which positions are expected to drop off faster and the Positional Scarcity Tracker (updates when sheet is filled out) to show remaining positive value left.

3. Check the Drafted box to mark off drafted players (Any value put into the box will change the formatting.) -- If adding keepers, mark them off before the draft (VAL will not be scaled this way).

4. If you're in a Dynasty League: Use a combination of DYN (scaled to dynasty value) and VAL.
Note: Keepers are crossed out automatically--if you add keepers after, treat them like normal players.

Data Sourced From @Mosers15's Pooled and Weighted Projections.

",,,,,,,,,,,,,,,,Estimated Positive Positional Value Remaining By Round,,,,,,,,,,,,,,,TJ Hockenson,MIN/6,7,6,TE7,8.08,- 9.01,21,139,9,
,,,Player,Tm/Bye,Pos Rank,ECR,Proj Pts,Tier,,Player,Tm/Bye,Pos Rank,ECR,Proj Pts,Tier,,,,,,,,,,,,,,,,,,,,Round,QB,QB Count,RB,RB Count,WR,WR Count,TE,TE Count,Largest Drop,,,,,,Brian Robinson,WAS/12,25,29,RB8,9.01,+ 8.05,21,115,9,
,,,Denver Broncos,DEN/12,1,1,156,DST1,,Brandon Aubrey,DAL/10,1,1,165,K1,,,,,,,,,,,,,,,,,,,,ROUND 1,100%,0,72%,5,79%,5,100%,0,,,,,,,Kaleb Johnson,PIT/5,26,26,RB8,7.01,- 8.06,21,157,9,`;
    
    // Parse the CSV
    const parser = new MockoSheetParser();
    const players = await parser.parseCSV(sampleCSVContent);
    
    console.log(`Successfully parsed ${players.length} players`);
    
    // Show some sample data
    console.log('\nSample QB players:');
    const qbPlayers = players.filter(p => p.position === 'QB').slice(0, 5);
    qbPlayers.forEach(player => {
      console.log(`${player.player} (${player.teamBye}) - ADP: ${player.adp}, VAL: ${player.val}, Tier: ${player.posTier}`);
    });
    
    console.log('\nSample RB players:');
    const rbPlayers = players.filter(p => p.position === 'RB').slice(0, 5);
    rbPlayers.forEach(player => {
      console.log(`${player.player} (${player.teamBye}) - ADP: ${player.adp}, VAL: ${player.val}, Tier: ${player.posTier}`);
    });
    
    console.log('\nSample WR players:');
    const wrPlayers = players.filter(p => p.position === 'WR').slice(0, 5);
    wrPlayers.forEach(player => {
      console.log(`${player.player} (${player.teamBye}) - ADP: ${player.adp}, VAL: ${player.val}, Tier: ${player.posTier}`);
    });
    
    console.log('\nSample DEF players:');
    const defPlayers = players.filter(p => p.position === 'DEF').slice(0, 3);
    defPlayers.forEach(player => {
      console.log(`${player.player} (${player.teamBye}) - ADP: ${player.adp}, VAL: ${player.val}, Tier: ${player.posTier}, VAL-ADP: ${player.valAdp}`);
    });
    
    console.log('\nSample K players:');
    const kPlayers = players.filter(p => p.position === 'K').slice(0, 3);
    kPlayers.forEach(player => {
      console.log(`${player.player} (${player.teamBye}) - ADP: ${player.adp}, VAL: ${player.val}, Tier: ${player.posTier}, VAL-ADP: ${player.valAdp}`);
    });
    
    // Test player lookup
    console.log('\nTesting player lookup:');
    const joshAllen = parser.getPlayerByName('Josh Allen', 'QB');
    if (joshAllen) {
      console.log(`Found Josh Allen: ADP ${joshAllen.adp}, VAL ${joshAllen.val}`);
    } else {
      console.log('Josh Allen not found');
    }
    
    return players;
  } catch (error) {
    console.error('Error testing CSV parser:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCSVParser().catch(console.error);
}

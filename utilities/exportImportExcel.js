const ExcelJS = require("exceljs");

const exportExcelFile = async (data, reply) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Players Histroy");

  const columns = [
    { header: "PlayerId", key: "playerId", },
    { header: "MatchTypeId", key: "matchTypeId", },
    { header: "PlayerName", key: "playerName", width: 50 },
    { header: "MatchTypeName", key: "matchTypeName", width: 50 },
    { header: "BattingHistroyId", key: "battingHistoryId", },
    { header: "BowlingHistoryId", key: "bowlingHistoryId", },
    { header: "MatchCount", key: "matchCount", },
    { header: "InningsCount", key: "inningsCount", },
    { header: "NotOut", key: "notOut", },
    { header: "TotalRuns", key: "totalRuns", },
    { header: "HighestScore", key: "highestScore", },
    { header: "Average", key: "average", },
    { header: "BallsFacedCount", key: "ballsFacedCount", },
    { header: "SrtikeRate", key: "strikeRate", },
    { header: "100Count", key: "countOf100", },
    { header: "50Count", key: "countOf50", },
    { header: "4Count", key: "countOf4", },
    { header: "6Count", key: "countOf6", },
    { header: "CatchCount", key: "catchCount", },
    { header: "StumpCount", key: "stumpCount", },
    { header: "OutCount", key: "outCount", },
    { header: "BowlerPlayedMatchCount", key: "bowlerPlayedMatchCount", },
    { header: "BowlerPlayedInningsCount", key: "bowlerPlayedInningsCount", },
    { header: "BallsCount", key: "ballCount", },
    { header: "RunsFromBowler", key: "runsFromBowler", },
    { header: "WicketsCount", key: "wicketsCount", },
    { header: "BestBowlingInMatch", key: "bestBowlingInMatch", },
    { header: "BestBowlingInInnings", key: "bestBowlingInInnings", },
    { header: "BowlerAverage", key: "bowlerAverage", },
    { header: "Economy", key: "economy", },
    { header: "BowlerStrikeRate", key: "bowlerStrikeRate", },
    { header: "4Wickets", key: "wickets4", },
    { header: "5Wickets", key: "wickets5", },
    { header: "10Wickets", key: "wickets10", },
  ];

  columns.forEach((column) => {
    if (!column.width) {
      column.width = column.header.length + 3;
    }
  });

  worksheet.columns = columns;
  worksheet.getRow(1).font = { bold: true, size: 12 };

  data.forEach((item) => {
    const row = worksheet.addRow(item);
    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'left' };
    });
  });
  const buffer = await workbook.xlsx.writeBuffer();
  
  return buffer
};

const importPlayersHistoryData = async (fileBuffer) => {

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.getWorksheet(1);

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const playerData = {
          playerId: row.getCell(1).value,
          matchTypeId: row.getCell(2).value,
          matchTypeName: row.getCell(4).value,
          battingHistoryId: row.getCell(5).value,
          bowlingHistoryId: row.getCell(6).value,
          matchCount: row.getCell(7).value,
          inningsCount: row.getCell(8).value,
          notOut: row.getCell(9).value,
          totalRuns: row.getCell(10).value,
          highestScore: row.getCell(11).value,
          average: row.getCell(12).value,
          ballsFacedCount: row.getCell(13).value,
          strikeRate: row.getCell(14).value,
          countOf100: row.getCell(15).value,
          countOf50: row.getCell(16).value,
          countOf4: row.getCell(17).value,
          countOf6: row.getCell(18).value,
          catchCount: row.getCell(19).value,
          stumpCount: row.getCell(20).value,
          outCount: row.getCell(21).value,
          bowlerPlayedMatchCount: row.getCell(22).value,
          bowlerPlayedInningsCount: row.getCell(23).value,
          ballCount: row.getCell(24).value,
          runsFromBowler: row.getCell(25).value,
          wicketsCount: row.getCell(26).value,
          bestBowlingInMatch: row.getCell(27).value,
          bestBowlingInInnings: row.getCell(28).value,
          bowlerAverage: row.getCell(29).value,
          economy: row.getCell(30).value,
          bowlerStrikeRate: row.getCell(31).value,
          wickets4: row.getCell(32).value,
          wickets5: row.getCell(33).value,
          wickets10: row.getCell(34).value,
      };
      rows.push(playerData);
    }
  });

  return rows;
};

module.exports = {
  exportExcelFile,
  importPlayersHistoryData,
};

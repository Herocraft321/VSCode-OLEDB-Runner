using System;
using System.Data;
using System.Data.OleDb;

namespace OLEDB_Runner
{
    internal class Program
    {
        static void Main(string[] args)
        {
            if (string.IsNullOrEmpty(args[0]))
            {
                throw new ArgumentException("You need to specify the 'Connection String' parameter", "Connection String");
            }

            if (string.IsNullOrEmpty(args[1]))
            {
                throw new ArgumentException("You need to specify the 'Query' parameter", "Query");
            }

            if (string.IsNullOrEmpty(args[2]))
            {
                throw new ArgumentException("You need to specify the 'TempFilePath' parameter", "TempFilePath");
            }

            DataTable dt = new DataTable();
            OleDbConnection oledbConnection = new OleDbConnection(args[0]);

            oledbConnection.Open();

            if (args[1].ToLower().Trim().StartsWith("select"))
            {
                OleDbDataAdapter adapter = new OleDbDataAdapter(args[1], oledbConnection);
                DataSet dataSet = new DataSet();

                adapter.Fill(dataSet);
                dt = dataSet.Tables[0];
            }
            else
            {
                OleDbCommand comand = new OleDbCommand(args[1], oledbConnection);
                comand.ExecuteNonQuery();
            }
            string html = @"<table border='1'>";
            //add header row
            html += "<tr>";
            for (int i = 0; i < dt.Columns.Count; i++)
                html += "<th style='font-size:30px'>" + dt.Columns[i].ColumnName + "</th>";
            html += "</tr>";
            //add rows
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                html += "<tr>";
                for (int j = 0; j < dt.Columns.Count; j++)
                    html += "<td style='font-size:15px'>" + dt.Rows[i][j].ToString() + "</td>";
                html += "</tr>";
            }
            html += "</table>";

            File.WriteAllText(args[2],html);
            Console.WriteLine("OK!");
        }
    }
}
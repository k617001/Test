using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Text.RegularExpressions;

namespace CommonUtil.Helper.CSVLoad.Plus
{
    /// <summary>
    /// csv當資料庫玩
    /// 整個資料夾當資料庫，裡面的檔案當tableName
    /// </summary>
    public class CsvConnection
    {
        string EX_NAME = "csv";
        string path = null;
        Dictionary<string, string> csvNameMap = null;
        string[] csvFileName = null;

        string runFileName = null;

        public CsvConnection(string path)
        {
            this.path = path;
            Init(new string[0]);
        }


        public CsvConnection(string path, string[] otherExName)
        {
            this.path = path;
            Init(otherExName);
        }

        private void Init(string[] otherExName)
        {
            if (otherExName == null)
            {
                otherExName = new string[0];
            }

            if (otherExName.Length == 0)
            {
                otherExName = new string[] {
                    EX_NAME
                };
            }

            //取得檔名
            string pattern = string.Join("|", otherExName.Select(s => "." + s.Replace(".", ""))) + "|" + EX_NAME;

            this.csvNameMap = Directory.GetFiles(path).Where(w =>
            {
                return Regex.IsMatch(w, pattern);
            })
            .ToDictionary(k => Path.GetFileName(k));
        }

        public string[] GetFileNames()
        {
            return csvNameMap.Keys.ToArray();
        }

        public CsvConnection SetRunFileName(string fileName)
        {

            if (!csvNameMap.ContainsKey(fileName))
            {
                throw new Exception("找不到這個檔案 =>" + fileName);
            }
            this.runFileName = fileName;
            return this;
        }

        public void Query(Action<int, CSVLoadConvert> loadAction)
        {
            if (string.IsNullOrEmpty(this.runFileName))
            {
                throw new Exception("未設定目前要執行的檔案!!! method=> SetRunFileName()");
            }

            if (loadAction == null)
            {
                throw new Exception("未設定目前要執行的方法!!!");
            }

            CSVLoadHelper.LoadCsv(csvNameMap[this.runFileName], loadAction);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Net.Sockets;

namespace CommonUtil.Util
{
    public class IdWorker
    {    
        static long WORKER_ID;
        static readonly long EPOCH = 1403854494756L;   // 
        static readonly int WORKER_ID_BITS = 10;      // 機器位數
        static readonly int MAX_WORKER_ID = -1 ^ -1 << WORKER_ID_BITS;// 機器ID最大值: 1023
        long sequence = 0L;                   
        static readonly int SEQUENCE_BITS = 12;      

        static readonly int WORKER_ID_SHIFT = SEQUENCE_BITS;                             // 12
        static readonly int TIMES_TAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;// 22
        static readonly int SEQUENCE_MASK = -1 ^ -1 << SEQUENCE_BITS;                 // 4095,111111111111,12位
        int lastTimestamp = -1;
        private static IdWorker flowIdWorker = new IdWorker(GetWorkerHostIp());


        private IdWorker(long workerId)
        {
            if (workerId > MAX_WORKER_ID || workerId < 0)
            {
                throw new Exception("worker Id can't be greater than " + MAX_WORKER_ID + " or less than 0");
            }
            WORKER_ID = workerId;
        }

        /// <summary>
        /// 建立物件
        /// </summary>
        /// <returns></returns>
        public static IdWorker getFlowIdWorkerInstance()
        {
            return flowIdWorker;
        }
        
 
        public long NextId() {
            int timestamp = IdWorker.TimeGen();
            // 前一個timestamp新的一樣，sequence+1(0-4095); 新的timestamp，sequence從0開始
            if (this.lastTimestamp == timestamp) {
                this.sequence = this.sequence + 1 & SEQUENCE_MASK;
                if (this.sequence == 0) {
                    timestamp = this.TilNextMillis(this.lastTimestamp);// 重新產生生成timestamp
                }
            } else {
                this.sequence = 0;
            }
 
            if (timestamp < this.lastTimestamp) {
                long sec = this.lastTimestamp - timestamp;
                throw new Exception("clock moved backwards.Refusing to generate id for " + sec + " milliseconds");
            }
 
            this.lastTimestamp = timestamp;
            return (timestamp - EPOCH) << TIMES_TAMP_LEFT_SHIFT | WORKER_ID << WORKER_ID_SHIFT | this.sequence;
        }

        /// <summary>
        /// 取下一个毫秒
        /// </summary>
        /// <param name="lastTimestamp"></param>
        /// <returns></returns>
        private int TilNextMillis(long lastTimestamp)
        {
            int timestamp = IdWorker.TimeGen();
            while (timestamp <= lastTimestamp)
            {
                timestamp = IdWorker.TimeGen();
            }
            return timestamp;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        private static int TimeGen()
        {
            return DateTime.Now.Millisecond;
        }

        /// <summary>
        /// 取得機器ip
        /// </summary>
        /// <returns></returns>
        public static int GetWorkerHostIp()
        {
            try
            {
                byte[] bytes = GetLocalIPAddress();
                return Convert.ToInt32(bytes[3] & 0xFF);
            }
            catch (Exception)
            {
                return 1;
            }

        }

        /// <summary>
        /// 取得ipAddress
        /// </summary>
        /// <returns></returns>
        public static byte[] GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.GetAddressBytes();
                }
            }
            throw new Exception("Local IP Address Not Found!");
        }
    }
}

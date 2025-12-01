using System;
using System.Collections.Generic;

namespace TaskManagerDAL.Models;

public partial class ApiLog
{
    public int LogId { get; set; }

    public string HttpMethod { get; set; }

    public string Path { get; set; }

    public string QueryString { get; set; }

    public string RequestBody { get; set; }

    public string ResponseBody { get; set; }

    public int? StatusCode { get; set; }

    public long? DurationMs { get; set; }

    public string IpAddress { get; set; }

    public DateTime? Timestamp { get; set; }
}

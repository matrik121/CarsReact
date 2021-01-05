using System;
using System.Collections.Generic;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CarsReact.Controllers
{
    [Route("api/[controller]")]
    public class DataController : Controller
    {
        private const string UsersDataUrl = "http://mobi.connectedcar360.net/api/?op=list";
        private const string CarsDataUrl = "http://mobi.connectedcar360.net/api/?op=getlocations&userid={0}";
        private const string ReverseGeoUrl = "https://nominatim.openstreetmap.org/reverse?lat={0}&lon={1}&format=json";

        private ActionResult GetDataFromUrl(string url, bool addUserAgent = false)
        {
            using (var client = new WebClient())
            {
                if (addUserAgent)
                {
                    client.Headers.Add ("user-agent", "Test task");
                }
                var json = client.DownloadString(url);
                try
                {
                    JToken.Parse(json);
                    return Content(json, "application/json");
                }
                catch (JsonReaderException)
                {
                    // in case of errors (server overload) returning empty json   
                    object newJson = new
                    {
                        data = new List<string>()
                    };
                    return Json(newJson);
                }
            }
        }

        [HttpGet("[action]")]
        public ActionResult GetAddress(double lat, double lon)
        {
            return GetDataFromUrl(String.Format(ReverseGeoUrl, lat, lon), true);
        }        

        [HttpGet("[action]")]
        [ResponseCache(Duration = 300)]
        public ActionResult GetUsersStore()
        {
            return GetDataFromUrl(UsersDataUrl);
        }

        [HttpGet("[action]")]
        [ResponseCache(Duration = 30)]
        public ActionResult GetCarsCoords(int userId)
        {
            return GetDataFromUrl(String.Format(CarsDataUrl, userId));
        }
    }
}
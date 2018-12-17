using System;
using System.Collections.Generic;
using System.Configuration;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class _Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        if (Request.Cookies["vid"] != null)
        {
        }
        else
        {
            if (Request["m"] != null)
            {
            }
            else
            {
                //Response.Redirect(ConfigurationManager.AppSettings["LoginAddress"] + HttpUtility.UrlEncode(HttpContext.Current.Request.Url.AbsoluteUri));
            }
        }
    }
}

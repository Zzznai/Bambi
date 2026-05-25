using System.Security.Claims;
using Bambi.Services.Common;

namespace Bambi.API.Common;

// Helpers for pulling identity bits out of the JWT-derived ClaimsPrincipal.
public static class CurrentUser
{
    public static int GetId(ClaimsPrincipal user)
    {
        // Prefer the custom "UserId" claim — it's the one we own and write
        // explicitly during token issuance. Fall back to NameIdentifier so
        // tokens minted before that custom claim existed still work.
        var userIdClaim = user.FindFirst("UserId");

        string? raw = null;
        if (userIdClaim != null)
        {
            raw = userIdClaim.Value;
        }
        else
        {
            var nameIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (nameIdClaim != null)
            {
                raw = nameIdClaim.Value;
            }
        }

        int id;
        if (int.TryParse(raw, out id))
        {
            return id;
        }

        throw new UnauthorizedException("Invalid token.");
    }

    public static bool IsAdmin(ClaimsPrincipal user)
    {
        if (user.IsInRole("admin"))
        {
            return true;
        }

        var roleClaim = user.FindFirst("Role");
        if (roleClaim != null && roleClaim.Value == "admin")
        {
            return true;
        }

        return false;
    }
}

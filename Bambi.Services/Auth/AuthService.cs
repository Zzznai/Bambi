using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bambi.Data.Entities;
using Bambi.Data.Enums;
using Bambi.Repositories.Users;
using Bambi.Services.Common;
using Bambi.Services.Dtos.Auth;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Bambi.Services.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly JwtSettings _jwt;

    public AuthService(IUserRepository users, IOptions<JwtSettings> jwt)
    {
        _users = users;
        _jwt = jwt.Value;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // Username and email both have to be unique — check each one
        // explicitly so the client gets a clear message about which one collided.
        bool usernameTaken = await _users.UsernameExistsAsync(request.Username);
        if (usernameTaken)
        {
            throw new ConflictException("Username already taken.");
        }

        bool emailTaken = await _users.EmailExistsAsync(request.Email);
        if (emailTaken)
        {
            throw new ConflictException("Email already registered.");
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            City = request.City,
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow,
        };

        await _users.AddAsync(user);

        return BuildResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        // The login form accepts either username or email — try as username
        // first, then fall back to email lookup.
        var user = await _users.GetByUsernameAsync(request.UsernameOrEmail);
        if (user == null)
        {
            user = await _users.GetByEmailAsync(request.UsernameOrEmail);
        }

        if (user == null)
        {
            throw new UnauthorizedException("Invalid credentials.");
        }

        bool passwordOk = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!passwordOk)
        {
            throw new UnauthorizedException("Invalid credentials.");
        }

        return BuildResponse(user);
    }

    private AuthResponseDto BuildResponse(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwt.ExpiryMinutes);

        // Role lowercases so the frontend's "admin"/"user" comparisons and the
        // [Authorize(Roles="admin")] attributes both work without surprises.
        string roleClaim = user.Role.ToString().ToLowerInvariant();

        var claims = new List<Claim>();
        claims.Add(new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()));
        claims.Add(new Claim("UserId", user.Id.ToString()));
        claims.Add(new Claim("Username", user.Username));
        claims.Add(new Claim(ClaimTypes.Name, user.Username));
        claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
        claims.Add(new Claim(ClaimTypes.Role, roleClaim));
        claims.Add(new Claim("Role", roleClaim));
        claims.Add(new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return new AuthResponseDto
        {
            Token = tokenString,
            ExpiresAt = expiresAt,
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            City = user.City,
            ProfilePicUrl = user.ProfilePicUrl,
            Role = roleClaim,
        };
    }
}

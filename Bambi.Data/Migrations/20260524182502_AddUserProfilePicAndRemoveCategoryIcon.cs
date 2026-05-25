using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bambi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfilePicAndRemoveCategoryIcon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IconUrl",
                table: "Categories");

            migrationBuilder.AddColumn<string>(
                name: "ProfilePicPublicId",
                table: "Users",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePicUrl",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfilePicPublicId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfilePicUrl",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "IconUrl",
                table: "Categories",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);
        }
    }
}

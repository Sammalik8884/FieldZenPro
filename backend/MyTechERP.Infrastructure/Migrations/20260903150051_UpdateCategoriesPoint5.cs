using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyTechERP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCategoriesPoint5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Categories SET Name = 'Services', Description = 'All labor and services' WHERE Name = 'Mobile Small Engine Services'");
            
            // Insert Materials if it doesn't exist
            migrationBuilder.Sql(@"
                INSERT INTO Categories (Name, Description, TenantId, CreatedAt)
                SELECT 'Materials', 'All materials and parts', Id, GETDATE()
                FROM Tenants
                WHERE NOT EXISTS (SELECT 1 FROM Categories c WHERE c.Name = 'Materials' AND c.TenantId = Tenants.Id);
            ");
            
            // Insert Services if it doesn't exist (in case 'Mobile Small Engine Services' wasn't there)
            migrationBuilder.Sql(@"
                INSERT INTO Categories (Name, Description, TenantId, CreatedAt)
                SELECT 'Services', 'All labor and services', Id, GETDATE()
                FROM Tenants
                WHERE NOT EXISTS (SELECT 1 FROM Categories c WHERE c.Name = 'Services' AND c.TenantId = Tenants.Id);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM Categories WHERE Name IN ('Materials', 'Services')");
        }
    }
}

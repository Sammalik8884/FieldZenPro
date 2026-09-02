using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using MytechERP.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyTechERP.Infrastructure.Services
{
    public class BlobService : IBlobService
    {
        private readonly string _connectionString;
        private readonly string _containerName = "evidence-vault";

        public BlobService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("AzureStorage") ?? string.Empty;
        }

        private BlobServiceClient GetClient()
        {
            if (string.IsNullOrEmpty(_connectionString) || !_connectionString.Contains("="))
            {
                throw new InvalidOperationException("Azure Storage connection string is missing or improperly formatted. Please configure 'ConnectionStrings:AzureStorage' in your environment.");
            }
            return new BlobServiceClient(_connectionString);
        }

        public async Task<string> UploadAsync(IFormFile file, string fileName)
        {
            var containerClient = GetClient().GetBlobContainerClient(_containerName);

            try
            {
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
            }
            catch (Azure.RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.ContainerAlreadyExists)
            {
                // Container already exists, ignore
            }
            catch (Azure.RequestFailedException ex) when (ex.ErrorCode == "PublicAccessNotPermitted")
            {
                // Storage account has public access disabled, create as private
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            }
            catch (Azure.RequestFailedException ex) when (ex.Status == 409)
            {
                // Fallback for any other 409
                await containerClient.CreateIfNotExistsAsync();
            }

            var blobClient = containerClient.GetBlobClient(fileName);


            using (var stream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(stream, true);
            }

            return blobClient.Uri.ToString();
        }

        public async Task<string> UploadStreamAsync(System.IO.Stream stream, string fileName, string contentType)
        {
            var containerClient = GetClient().GetBlobContainerClient(_containerName);
            try
            {
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
            }
            catch (Azure.RequestFailedException ex) when (ex.ErrorCode == BlobErrorCode.ContainerAlreadyExists)
            {
                // Container already exists, ignore
            }
            catch (Azure.RequestFailedException ex) when (ex.ErrorCode == "PublicAccessNotPermitted")
            {
                // If the storage account does not allow public access, create it as a private container
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
            }
            catch (Azure.RequestFailedException ex) when (ex.Status == 409)
            {
                // Fallback for other 409 errors that prevent creation
                await containerClient.CreateIfNotExistsAsync();
            }

            var blobClient = containerClient.GetBlobClient(fileName);

            var blobHttpHeaders = new BlobHttpHeaders { ContentType = contentType };
            await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = blobHttpHeaders });

            return blobClient.Uri.ToString();
        }
    }
}
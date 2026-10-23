-- Baseline schema for a fresh PassVault database (structure only, no data).
-- Generated 2026-10-23 with: pg_dump --schema-only --no-owner --no-privileges
-- from the live database, because migrations 001-017 were never committed.
-- Already includes 018 and 019. On an empty database apply this, then only
-- migrations numbered 020 and up. tblConfigs/tblWhitelabels rows (JWT secrets, VAULTMASTERKEY,
-- APPENCRYPTIONKEY, Google keys ...) still have to be seeded separately.

--
-- PostgreSQL database dump
--

\restrict scvYagqJS543JQsQjOGhU7asWLK16ezbjIAH0GUPDjSx3DQ87w9geYHsPeBRiJi

-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: tblAPIEndpoints_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblAPIEndpoints_wrId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: tblAPIEndpoints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblAPIEndpoints" (
    "wrId" integer DEFAULT nextval('public."tblAPIEndpoints_wrId_seq"'::regclass) NOT NULL,
    "wrServiceType" integer,
    "wrEndpoint" character varying,
    "wrModuleType" integer,
    "wrTimeOut" integer DEFAULT 0 NOT NULL,
    "wrIsActive" boolean DEFAULT false NOT NULL,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrCreatedDate" timestamp with time zone DEFAULT now()
);


--
-- Name: tblAPIs_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblAPIs_wrId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblAPIs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblAPIs" (
    "wrId" integer DEFAULT nextval('public."tblAPIs_wrId_seq"'::regclass) NOT NULL,
    "wrType" integer DEFAULT 0 NOT NULL,
    "wrApi" character varying,
    "wrIsActive" boolean DEFAULT false NOT NULL,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrCreatedDate" timestamp with time zone DEFAULT now()
);


--
-- Name: tblActivityLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblActivityLogs" (
    "wrId" integer NOT NULL,
    "wrActivityType" integer NOT NULL,
    "wrRefID" character varying(200),
    "wrIpAddress" character varying(255) NOT NULL,
    "wrCreatedDate" timestamp with time zone,
    "wrClientId" integer,
    "wrDeviceInfo" text,
    "wrLatitude" double precision,
    "wrLongitude" double precision,
    "wrEntryName" character varying(200)
);


--
-- Name: tblActivityLogs_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblActivityLogs_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblActivityLogs_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblActivityLogs_wrId_seq" OWNED BY public."tblActivityLogs"."wrId";


--
-- Name: tblAdvertise; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblAdvertise" (
    "wrId" integer NOT NULL,
    "wrTitle" character varying,
    "wrImage" text,
    "wrLink" text,
    "wrIsPermanent" boolean DEFAULT false,
    "wrIsActive" boolean DEFAULT false,
    "wrStartDate" timestamp with time zone,
    "wrEndDate" timestamp with time zone,
    "wrCreatedBy" integer,
    "wrCreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "wrUpdatedBy" integer,
    "wrUpdatedAt" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp with time zone,
    "wrViewerCount" integer DEFAULT 0,
    "wrWhitelabelId" integer[],
    "wrDisplayOrder" integer
);


--
-- Name: tblAdvertise_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblAdvertise_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblAdvertise_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblAdvertise_wrId_seq" OWNED BY public."tblAdvertise"."wrId";


--
-- Name: tblArticles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblArticles" (
    "wrId" integer NOT NULL,
    "wrTitle" character varying(1000),
    "wrArticle" text,
    "wrImage" character varying(200),
    "wrIsPermanent" boolean NOT NULL,
    "wrStartDate" timestamp without time zone,
    "wrEndDate" timestamp without time zone,
    "wrIsActive" boolean NOT NULL,
    "wrCreatedDate" timestamp without time zone,
    "wrCreatedBy" integer,
    "wrModifyBy" integer,
    "wrModifyDate" timestamp without time zone,
    "wrTags" character varying(10000),
    "wrViewerCount" integer,
    "wrCredit" text,
    "wrSEO" character varying,
    "wrSEODescription" text,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrImagePath" character varying
);


--
-- Name: tblArticles_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblArticles_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblArticles_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblArticles_wrId_seq" OWNED BY public."tblArticles"."wrId";


--
-- Name: tblBanner_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblBanner_wrId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblBanner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblBanner" (
    "wrId" integer DEFAULT nextval('public."tblBanner_wrId_seq"'::regclass) NOT NULL,
    "wrTitle" character varying(1000),
    "wrBannerType" integer NOT NULL,
    "wrImage" character varying,
    "wrIsPermanent" boolean,
    "wrStartDate" timestamp with time zone,
    "wrEndDate" timestamp with time zone,
    "wrIsActive" boolean,
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrLink" character varying(10000),
    "wrViewerCount" integer,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrImagePath" character varying,
    "wrDeviceTypeId" integer,
    "wrWhitelabelId" integer[],
    "wrDisplayOrder" integer
);


--
-- Name: tblBlocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblBlocks" (
    "wrBlockId" integer NOT NULL,
    "wrBlockName" character varying(200) NOT NULL,
    "wrIsShowContent" boolean NOT NULL,
    "wrContent" text,
    "wrContainerId" character varying(100) DEFAULT NULL::character varying,
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblBlocks_wrBlockId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblBlocks_wrBlockId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblBlocks_wrBlockId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblBlocks_wrBlockId_seq" OWNED BY public."tblBlocks"."wrBlockId";


--
-- Name: tblClient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblClient" (
    "wrClientId" integer NOT NULL,
    "wrName" character varying(200),
    "wrEmail" character varying(200) NOT NULL,
    "wrGoogleId" character varying(200),
    "wrProvider" integer DEFAULT 1,
    "wrIsEmailVerified" boolean DEFAULT false,
    "wrPackageId" integer,
    "wrDriveRefreshToken" text,
    "wrIsActive" boolean DEFAULT true,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedAt" timestamp with time zone,
    "wrCreatedAt" timestamp with time zone DEFAULT now(),
    "wrUpdatedAt" timestamp with time zone DEFAULT now(),
    "wrPasswordHash" text,
    "wrWhitelabelId" integer,
    "wrUsername" character varying(50),
    "wrMobileNo" character varying(20),
    "wrAddress" character varying(500),
    "WrOTPEnable" boolean DEFAULT true,
    "WeOTPType" integer DEFAULT 1,
    "WrUuid" character varying(1000),
    "wrFailedLoginAttempts" integer DEFAULT 0 NOT NULL,
    "wrLockedUntil" timestamp with time zone,
    "wrIsSelfSuspended" boolean DEFAULT false NOT NULL,
    "wrSelfSuspendedAt" timestamp with time zone,
    "wrPackageExpiryDate" timestamp without time zone
);


--
-- Name: tblClientSockets_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblClientSockets_wrId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblClientSockets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblClientSockets" (
    "wrId" integer DEFAULT nextval('public."tblClientSockets_wrId_seq"'::regclass) NOT NULL,
    "wrServerName" character varying,
    "wrUrl" character varying NOT NULL,
    "wrStatus" integer DEFAULT 0,
    "wrIsActive" boolean DEFAULT false,
    "wrReconnectDelay" integer,
    "wrReconnectAttempts" integer,
    "wrReconnectMaxDelay" integer,
    "wrReconnectCount" integer DEFAULT 0,
    "wrActionType" integer DEFAULT 0,
    "wrConnectCount" integer DEFAULT 0,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrCreatedDate" timestamp with time zone DEFAULT now(),
    "wrIsUpdateView" boolean DEFAULT false,
    "wrUpdateInterval" integer,
    "wrIsAPNSEnable" boolean DEFAULT false,
    "wrAPNSProdHost" text,
    "wrAPNSSandboxHost" text,
    "wrAPNSKeyId" text,
    "wrAPNSTeamId" text,
    "wrAPNSBundleId" text,
    "wrAPNSKeyPath" text,
    "wrIsAPNSLogEnable" boolean DEFAULT false,
    "wrAPNSEnvType" integer DEFAULT 2
);


--
-- Name: tblClientVaultEntries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblClientVaultEntries" (
    "wrEntryId" uuid NOT NULL,
    "wrClientId" integer NOT NULL,
    "wrEntryType" integer NOT NULL,
    "wrIsDeleted" boolean DEFAULT false,
    "wrCreatedAt" timestamp with time zone DEFAULT now(),
    "wrUpdatedAt" timestamp with time zone DEFAULT now()
);


--
-- Name: tblClientVaultKey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblClientVaultKey" (
    "wrKeyId" integer NOT NULL,
    "wrClientId" integer NOT NULL,
    "wrWrappedKey" text NOT NULL,
    "wrKdfSalt" character varying(200) NOT NULL,
    "wrKeyVersion" integer DEFAULT 1,
    "wrIsActive" boolean DEFAULT true,
    "wrRecoveredAt" timestamp with time zone,
    "wrRecoveredCount" integer DEFAULT 0,
    "wrCreatedAt" timestamp with time zone DEFAULT now(),
    "wrUpdatedAt" timestamp with time zone DEFAULT now()
);


--
-- Name: tblClientVaultKey_wrKeyId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblClientVaultKey_wrKeyId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblClientVaultKey_wrKeyId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblClientVaultKey_wrKeyId_seq" OWNED BY public."tblClientVaultKey"."wrKeyId";


--
-- Name: tblClient_wrClientID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblClient_wrClientID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblClient_wrClientId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblClient_wrClientId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblClient_wrClientId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblClient_wrClientId_seq" OWNED BY public."tblClient"."wrClientId";


--
-- Name: tblConfigs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblConfigs" (
    "wrId" integer NOT NULL,
    "wrKey" character varying(200),
    "wrValue" character varying(2000) NOT NULL,
    "wrDesc" text,
    "wrIsActive" boolean NOT NULL,
    "wrIsForAdmin" boolean,
    "wrCreatedDate" timestamp with time zone,
    "wrCreatedBy" integer,
    "wrModifiedDate" timestamp with time zone,
    "wrModifiedBy" integer,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblConfigs_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblConfigs_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblConfigs_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblConfigs_wrId_seq" OWNED BY public."tblConfigs"."wrId";


--
-- Name: tblCountryCodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblCountryCodes" (
    "wrId" integer NOT NULL,
    "wrCountryCode" character varying,
    "wrCountryName" character varying,
    "wrFlag" character varying,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrFlagPath" character varying,
    "wrIsActive" boolean,
    "wrMaxNumber" smallint,
    "wrShortName" character varying,
    "wrTimezone" character varying,
    "wrIsClientShow" boolean,
    "wrIsDefault" boolean DEFAULT false,
    "wrCreatedDate" timestamp with time zone DEFAULT now()
);


--
-- Name: tblCountryCodes_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblCountryCodes_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblCountryCodes_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblCountryCodes_wrId_seq" OWNED BY public."tblCountryCodes"."wrId";


--
-- Name: tblDeletedClientActivityLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblDeletedClientActivityLogs" (
    "wrId" integer NOT NULL,
    "wrActivityType" integer NOT NULL,
    "wrRefID" character varying(200),
    "wrIpAddress" character varying(255) NOT NULL,
    "wrCreatedDate" timestamp with time zone,
    "wrClientId" integer NOT NULL,
    "wrDeviceInfo" text,
    "wrLatitude" double precision,
    "wrLongitude" double precision,
    "wrDeletedClientId" integer NOT NULL,
    "wrArchivedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tblDeletedClientVaultEntries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblDeletedClientVaultEntries" (
    "wrEntryId" uuid NOT NULL,
    "wrClientId" integer NOT NULL,
    "wrEntryType" integer NOT NULL,
    "wrIsDeleted" boolean DEFAULT false,
    "wrCreatedAt" timestamp with time zone,
    "wrUpdatedAt" timestamp with time zone,
    "wrDeletedClientId" integer NOT NULL,
    "wrArchivedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tblDeletedClientVaultKeys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblDeletedClientVaultKeys" (
    "wrKeyId" integer NOT NULL,
    "wrClientId" integer NOT NULL,
    "wrWrappedKey" text NOT NULL,
    "wrKdfSalt" character varying(200) NOT NULL,
    "wrKeyVersion" integer,
    "wrIsActive" boolean,
    "wrRecoveredAt" timestamp with time zone,
    "wrRecoveredCount" integer,
    "wrCreatedAt" timestamp with time zone,
    "wrUpdatedAt" timestamp with time zone,
    "wrDeletedClientId" integer NOT NULL,
    "wrArchivedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tblDeletedClients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblDeletedClients" (
    "wrId" integer NOT NULL,
    "wrOriginalClientId" integer NOT NULL,
    "wrEmail" character varying(200) NOT NULL,
    "wrName" character varying(200),
    "wrUsername" character varying(50),
    "wrReason" text,
    "wrClientSnapshot" jsonb NOT NULL,
    "wrVaultEntriesSnapshot" jsonb,
    "wrActivityLogsSnapshot" jsonb,
    "wrDeletedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tblDeletedClients_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblDeletedClients_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblDeletedClients_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblDeletedClients_wrId_seq" OWNED BY public."tblDeletedClients"."wrId";


--
-- Name: tblDevices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblDevices" (
    "wrDeviceId" integer NOT NULL,
    "wrName" text,
    "wrPushEndpoint" text,
    "wrPushP256DH" text,
    "wrPushAuth" text,
    "wrCreatedDate" timestamp without time zone,
    "wrUserId" integer,
    "wrUserType" integer,
    "wrDeviceType" integer,
    "wrMobileToken" text,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrTempCId" integer,
    "wrBiometricEnrolled" boolean DEFAULT false,
    "wrLastSyncedDriveRevision" character varying(200)
);


--
-- Name: tblDevices_wrDeviceId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblDevices_wrDeviceId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblDevices_wrDeviceId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblDevices_wrDeviceId_seq" OWNED BY public."tblDevices"."wrDeviceId";


--
-- Name: tblEncryptedData; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblEncryptedData" (
    "wrId" integer NOT NULL,
    "wrKey" integer,
    "wrValue" character varying(1000) NOT NULL,
    "wrCreatedDate" timestamp with time zone DEFAULT now()
);


--
-- Name: tblEncryptedData_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblEncryptedData_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblEncryptedData_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblEncryptedData_wrId_seq" OWNED BY public."tblEncryptedData"."wrId";


--
-- Name: tblErrorLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblErrorLogs" (
    "wrErrId" integer NOT NULL,
    "wrErrMessage" text,
    "wrErrStack" character varying(1000),
    "wrDomain" character varying(1000),
    "wrUserId" integer,
    "wrUserIp" character varying(1000),
    "wrApi" character varying(1000),
    "wrCreatedDate" timestamp with time zone,
    "wrRequestBody" json,
    "wrData" jsonb
);


--
-- Name: tblErrorLogs_wrErrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblErrorLogs_wrErrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblErrorLogs_wrErrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblErrorLogs_wrErrId_seq" OWNED BY public."tblErrorLogs"."wrErrId";


--
-- Name: tblLibraryImages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblLibraryImages" (
    "wrId" integer NOT NULL,
    "wrPhotoLibraryId" integer NOT NULL,
    "wrTitle" character varying,
    "wrImage" character varying,
    "wrDisplayOrder" integer,
    "wrIsDefault" boolean DEFAULT false,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrImagePath" character varying,
    "wrCreatedDate" timestamp with time zone DEFAULT now()
);


--
-- Name: tblLibraryImages_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblLibraryImages_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblLibraryImages_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblLibraryImages_wrId_seq" OWNED BY public."tblLibraryImages"."wrId";


--
-- Name: tblMailSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblMailSettings" (
    "wrId" integer NOT NULL,
    "wrEmail" character varying(200) NOT NULL,
    "wrUserName" character varying(200) NOT NULL,
    "wrPassword" text NOT NULL,
    "wrMailType" integer NOT NULL,
    "wrSmtpAddress" character varying(200),
    "wrPortNumber" integer,
    "wrIsEnableSSL" boolean,
    "wrIsActive" boolean,
    "wrIsDefault" boolean DEFAULT false NOT NULL,
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrModifiedBy" integer,
    "wrModifiedDate" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblMailSettings_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblMailSettings_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblMailSettings_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblMailSettings_wrId_seq" OWNED BY public."tblMailSettings"."wrId";


--
-- Name: tblMenuItemTypes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblMenuItemTypes" (
    "wrMenuItemTypeId" integer NOT NULL,
    "wrMenuItemType" character varying(100),
    "wrIsActive" boolean,
    "wrCreatedDate" timestamp with time zone,
    "wrCreatedBy" integer,
    "wrModifyDate" timestamp with time zone,
    "wrModifyBy" integer,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblMenuItemTypes_wrMenuItemTypeId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblMenuItemTypes_wrMenuItemTypeId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblMenuItemTypes_wrMenuItemTypeId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblMenuItemTypes_wrMenuItemTypeId_seq" OWNED BY public."tblMenuItemTypes"."wrMenuItemTypeId";


--
-- Name: tblMenuItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblMenuItems" (
    "wrMenuItemId" integer NOT NULL,
    "wrMenuTypeId" integer NOT NULL,
    "wrMenuItem" character varying(2000) NOT NULL,
    "wrParentId" integer NOT NULL,
    "wrDisplayOrder" integer NOT NULL,
    "wrPageId" integer NOT NULL,
    "wrIsActive" boolean NOT NULL,
    "wrMenuItemTypeId" integer,
    "wrCreatedDate" timestamp with time zone NOT NULL,
    "wrCreatedBy" integer NOT NULL,
    "wrModifyBy" integer,
    "wrModifyDate" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblMenuItems_wrMenuItemId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblMenuItems_wrMenuItemId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblMenuItems_wrMenuItemId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblMenuItems_wrMenuItemId_seq" OWNED BY public."tblMenuItems"."wrMenuItemId";


--
-- Name: tblMenuTypes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblMenuTypes" (
    "wrMenuTypeId" integer NOT NULL,
    "wrBlockId" integer,
    "wrMenuTypeName" character varying(200),
    "wrIsActive" boolean,
    "wrNoOfLevel" integer,
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrModifyBy" integer,
    "wrModifyDate" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblMenuTypes_wrMenuTypeId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblMenuTypes_wrMenuTypeId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblMenuTypes_wrMenuTypeId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblMenuTypes_wrMenuTypeId_seq" OWNED BY public."tblMenuTypes"."wrMenuTypeId";


--
-- Name: tblnews_wrnewsid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tblnews_wrnewsid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblNews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblNews" (
    "wrNewsId" integer DEFAULT nextval('public.tblnews_wrnewsid_seq'::regclass) NOT NULL,
    "wrTitle" character varying(1000),
    "wrNews" character varying,
    "wrImage" character varying,
    "wrIsPermanent" boolean,
    "wrStartDate" timestamp with time zone,
    "wrEndDate" timestamp with time zone,
    "wrIsActive" boolean,
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrModifyBy" integer,
    "wrModifyDate" timestamp with time zone,
    "wrTags" character varying(10000),
    "wrViewerCount" integer,
    "wrCredit" text,
    "wrSEO" text,
    "wrSEODescription" text,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrType" smallint,
    "wrImagePath" character varying,
    "wrWhitelabelId" integer[],
    "wrDisplayOrder" integer,
    "wrCommentaryId" integer
);


--
-- Name: tblNotificationConfig; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblNotificationConfig" (
    "wrId" integer NOT NULL,
    "wrEventName" integer,
    "wrContent" text,
    "wrIsActive" boolean,
    "wrCreatedBy" integer,
    "wrCreatedAt" timestamp with time zone,
    "wrUpdatedBy" integer,
    "wrUpdatedAt" timestamp with time zone,
    "wrTitle" text
);


--
-- Name: tblNotificationConfig_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblNotificationConfig_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblNotificationConfig_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblNotificationConfig_wrId_seq" OWNED BY public."tblNotificationConfig"."wrId";


--
-- Name: tblNotificationLogs_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblNotificationLogs_wrId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblNotificationLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblNotificationLogs" (
    "wrId" integer DEFAULT nextval('public."tblNotificationLogs_wrId_seq"'::regclass) NOT NULL,
    "wrNotificationId" integer NOT NULL,
    "wrClientId" integer NOT NULL,
    "wrIsRead" boolean DEFAULT false NOT NULL,
    "wrCreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tblNotifications_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblNotifications_wrId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblNotifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblNotifications" (
    "wrId" integer DEFAULT nextval('public."tblNotifications_wrId_seq"'::regclass) NOT NULL,
    "wrTitle" character varying NOT NULL,
    "wrDescription" text,
    "wrCommentaryId" integer,
    "wrSendType" integer,
    "wrCreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "wrCreatedBy" integer,
    "wrModifyAt" timestamp with time zone,
    "wrModifyBy" integer,
    "wrUrl" text,
    "wrImage" text,
    "wrIcon" text,
    "wrIsSend" boolean DEFAULT false,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrImagePath" character varying,
    "wrIconPath" character varying
);


--
-- Name: tblPackages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblPackages" (
    "wrId" integer NOT NULL,
    "wrName" character varying,
    "wrDescription" character varying,
    "wrPrice" integer,
    "wrCurrency" character varying,
    "wrIntervalType" integer,
    "wrIntervalCount" integer,
    "wrRazorPayPlanId" character varying,
    "wrIsActive" boolean,
    "wrIsDisplay" boolean,
    "wrDisplayOrder" integer,
    "wrTrialDays" integer,
    "wrIsDefault" boolean,
    "wrCreatedBy" integer,
    "wrCreatedAt" timestamp with time zone,
    "wrUpdatedBy" integer,
    "wrUpdatedAt" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp with time zone,
    "wrMaxAccounts" integer,
    "wrMaxGroups" integer,
    "wrMaxNotes" integer
);


--
-- Name: tblPackages_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblPackages_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblPackages_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblPackages_wrId_seq" OWNED BY public."tblPackages"."wrId";


--
-- Name: tblPageAliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblPageAliases" (
    "wrPageAliasId" integer NOT NULL,
    "wrPageId" integer,
    "wrMenuItemId" integer,
    "wrPageName" character varying(600),
    "wrPageTitle" character varying(600),
    "wrAlias" character varying(600),
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrModifyBy" integer,
    "wrModifyDate" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblPageAliases_wrPageAliasId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblPageAliases_wrPageAliasId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblPageAliases_wrPageAliasId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblPageAliases_wrPageAliasId_seq" OWNED BY public."tblPageAliases"."wrPageAliasId";


--
-- Name: tblPageFormats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblPageFormats" (
    "wrPageFormatId" integer NOT NULL,
    "wrPageFormatName" character varying(200),
    "wrPageName" character varying(200),
    "wrImage" character varying(200),
    "wrDescription" character varying(255),
    "wrIsActive" boolean,
    "wrCreatedDate" timestamp with time zone,
    "wrCreatedBy" integer,
    "wrModifyBy" integer,
    "wrModifyDate" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrImagePath" character varying
);


--
-- Name: tblPageFormats_wrPageFormatId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblPageFormats_wrPageFormatId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblPageFormats_wrPageFormatId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblPageFormats_wrPageFormatId_seq" OWNED BY public."tblPageFormats"."wrPageFormatId";


--
-- Name: tblPages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblPages" (
    "wrPageId" integer NOT NULL,
    "wrPageTitle" character varying(600),
    "wrPageHeading" character varying(600),
    "wrPageName" character varying(600),
    "wrAlias" character varying(600),
    "wrIsLink" boolean,
    "wrLinkURL" character varying(600),
    "wrPageFormatId" integer,
    "wrIsOpenInNewTab" boolean,
    "wrPageContent" character varying(10000000) DEFAULT NULL::character varying,
    "wrSEOWord" character varying,
    "wrSEODescription" character varying,
    "wrCreatedDate" timestamp with time zone,
    "wrCreatedBy" integer,
    "wrIsDefault" boolean,
    "wrDynamicParameters" character varying,
    "wrModifyBy" integer,
    "wrModifyDate" timestamp with time zone,
    "wrIsStatic" boolean,
    "wrWhiteLabelId" integer,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblPages_wrPageId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblPages_wrPageId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblPages_wrPageId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblPages_wrPageId_seq" OWNED BY public."tblPages"."wrPageId";


--
-- Name: tblPaymentMethods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblPaymentMethods" (
    "wrId" integer NOT NULL,
    "wrType" character varying(10) NOT NULL,
    "wrLabel" character varying(150) NOT NULL,
    "wrQrImageUrl" character varying(500),
    "wrUpiId" character varying(100),
    "wrBankName" character varying(150),
    "wrAccountHolderName" character varying(150),
    "wrAccountNumber" character varying(50),
    "wrIfscCode" character varying(20),
    "wrBranch" character varying(150),
    "wrInstructions" text,
    "wrIsActive" boolean DEFAULT true NOT NULL,
    "wrIsDefault" boolean DEFAULT false NOT NULL,
    "wrIsDeleted" boolean DEFAULT false NOT NULL,
    "wrCreatedBy" integer,
    "wrCreatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "wrUpdatedBy" integer,
    "wrUpdatedAt" timestamp without time zone,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    CONSTRAINT "tblPaymentMethods_wrType_check" CHECK ((("wrType")::text = ANY ((ARRAY['QR'::character varying, 'BANK'::character varying])::text[])))
);


--
-- Name: tblPaymentMethods_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblPaymentMethods_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblPaymentMethods_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblPaymentMethods_wrId_seq" OWNED BY public."tblPaymentMethods"."wrId";


--
-- Name: tblPermissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblPermissions" (
    "wrPermissionId" integer NOT NULL,
    "wrRoleId" integer,
    "wrTabId" integer,
    "wrIsView" boolean,
    "wrIsAdd" boolean,
    "wrIsEdit" boolean,
    "wrIsDelete" boolean,
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblPermissions_wrPermissionId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblPermissions_wrPermissionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblPermissions_wrPermissionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblPermissions_wrPermissionId_seq" OWNED BY public."tblPermissions"."wrPermissionId";


--
-- Name: tblPhotoLibrary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblPhotoLibrary" (
    "wrPhotoLibraryId" integer NOT NULL,
    "wrTitle" character varying,
    "wrSEO" text,
    "wrDescription" text,
    "wrIsPermanent" boolean DEFAULT false,
    "wrStartDate" timestamp with time zone,
    "wrEndDate" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp with time zone,
    "wrCreatedDate" timestamp with time zone DEFAULT now(),
    "wrIsActive" boolean DEFAULT false,
    "wrDisplayOrder" integer,
    "wrCommentaryId" integer DEFAULT 0,
    "wrWhitelabelId" integer[],
    "wrViewCount" integer DEFAULT 0
);


--
-- Name: tblPhotoLibrary_wrPhotoLibraryId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblPhotoLibrary_wrPhotoLibraryId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblPhotoLibrary_wrPhotoLibraryId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblPhotoLibrary_wrPhotoLibraryId_seq" OWNED BY public."tblPhotoLibrary"."wrPhotoLibraryId";


--
-- Name: tblPlanUpgradeRequests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblPlanUpgradeRequests" (
    "wrId" integer NOT NULL,
    "wrClientId" integer NOT NULL,
    "wrCurrentPackageId" integer,
    "wrRequestedPackageId" integer NOT NULL,
    "wrPaymentMethodId" integer,
    "wrAmount" numeric(10,2),
    "wrCurrency" character varying(10),
    "wrTransferCode" character varying(100) NOT NULL,
    "wrStatus" character varying(10) DEFAULT 'PENDING'::character varying NOT NULL,
    "wrRejectionReason" character varying(500),
    "wrReviewedBy" integer,
    "wrReviewedByName" character varying(150),
    "wrReviewedAt" timestamp without time zone,
    "wrCreatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "tblPlanUpgradeRequests_wrStatus_check" CHECK ((("wrStatus")::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: tblPlanUpgradeRequests_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblPlanUpgradeRequests_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblPlanUpgradeRequests_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblPlanUpgradeRequests_wrId_seq" OWNED BY public."tblPlanUpgradeRequests"."wrId";


--
-- Name: tblRoles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblRoles" (
    "wrRoleId" integer NOT NULL,
    "wrRoleName" character varying(1000),
    "wrDisplayType" integer,
    "wrDescription" character varying(100),
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrModifyDate" timestamp with time zone,
    "wrModifyBy" integer,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrIsActive" boolean DEFAULT false
);


--
-- Name: tblRoles_wrRoleId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblRoles_wrRoleId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblRoles_wrRoleId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblRoles_wrRoleId_seq" OWNED BY public."tblRoles"."wrRoleId";


--
-- Name: tblSocialMedias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblSocialMedias" (
    "wrId" integer NOT NULL,
    "wrName" character varying NOT NULL,
    "wrLink" character varying NOT NULL,
    "wrImage" character varying,
    "wrIsActive" boolean,
    "wrCreatedAt" timestamp without time zone,
    "wrCreatedBy" integer,
    "wrModifiedBy" integer,
    "wrModifiedAt" timestamp without time zone,
    "wrImagePath" character varying
);


--
-- Name: tblSocialMedias_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblSocialMedias_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblSocialMedias_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblSocialMedias_wrId_seq" OWNED BY public."tblSocialMedias"."wrId";


--
-- Name: tblTabs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblTabs" (
    "wrTabId" integer NOT NULL,
    "wrTabName" character varying(100),
    "WrDisplayName" character varying(100),
    "wrDisplayType" integer,
    "wrWebPage" character varying(100),
    "wrParentId" character varying(255),
    "wrIsActive" boolean,
    "wrIsAdd" boolean,
    "wrIsEdit" boolean,
    "wrIsDelete" boolean,
    "wrIsView" boolean,
    "wrAddWebpage" character varying(100),
    "wrIsMenu" boolean,
    "wrIconName" character varying(100),
    "wrDisplayOrder" integer,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone,
    "wrCreatedDate" timestamp with time zone DEFAULT now()
);


--
-- Name: tblTabs_wrTabId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblTabs_wrTabId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblTabs_wrTabId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblTabs_wrTabId_seq" OWNED BY public."tblTabs"."wrTabId";


--
-- Name: tblTemplate_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblTemplate_wrId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblTemplate" (
    "wrId" integer DEFAULT nextval('public."tblTemplate_wrId_seq"'::regclass) NOT NULL,
    "wrTemplateType" integer NOT NULL,
    "wrType" integer NOT NULL,
    "wrTitle" character varying(200),
    "wrDescription" text,
    "wrIsActive" boolean,
    "wrCreatedBy" integer,
    "wrCreatedDate" timestamp with time zone,
    "wrModifyBy" integer,
    "wrModifyDate" timestamp with time zone,
    "wrIsDefault" boolean DEFAULT false,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp without time zone
);


--
-- Name: tblUserLoginInfos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblUserLoginInfos" (
    "WrID" integer NOT NULL,
    "WrUserId" integer,
    "WrUserType" integer DEFAULT 0 NOT NULL,
    "wrInfo" character varying(2000),
    "wrIsLogin" boolean,
    "WrCreatedDate" timestamp with time zone,
    "wrToken" uuid,
    "wrClientID" integer,
    "wrCreatedDate" timestamp with time zone DEFAULT now()
);


--
-- Name: tblUserLoginInfos_WrID_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblUserLoginInfos_WrID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblUserLoginInfos_WrID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblUserLoginInfos_WrID_seq" OWNED BY public."tblUserLoginInfos"."WrID";


--
-- Name: tblUserdeleteLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblUserdeleteLogs" (
    "wrUserDeletelogId" integer NOT NULL,
    "wrDeletebyId" integer,
    "wrDeletedDate" timestamp without time zone,
    "WrUserId" integer,
    "WrUserName" character varying,
    "WrPassword" character varying,
    "WrRoleId" integer,
    "WrName" character varying,
    "WrUserType" integer,
    "WrMobile" character varying,
    "WrIsActive" boolean,
    "WrIsSuperAdmin" boolean,
    "WrCreatedBy" integer,
    "WrCreatedDate" timestamp without time zone,
    "WrCreatedType" integer,
    "WrModifyBy" integer,
    "WrModifyDate" timestamp without time zone,
    "WrModifyType" integer,
    "WrParentId" integer,
    "WrIsDelete" boolean,
    "WrDeleteBy" integer,
    "WrDeleteDate" timestamp without time zone,
    "WrAllowMultipleLogin" boolean,
    "WrSubAdminId" integer,
    "WrUserIp" character varying
);


--
-- Name: tblUserdeleteLogs_wrUserDeletelogId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblUserdeleteLogs_wrUserDeletelogId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblUserdeleteLogs_wrUserDeletelogId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblUserdeleteLogs_wrUserDeletelogId_seq" OWNED BY public."tblUserdeleteLogs"."wrUserDeletelogId";


--
-- Name: tblUsers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblUsers" (
    "WrUserId" integer NOT NULL,
    "WrUserName" character varying(100),
    "WrPassword" character varying(200),
    "WrRoleId" integer,
    "WrName" character varying(200),
    "WrUserType" integer DEFAULT 0 NOT NULL,
    "WrMobile" character varying(20),
    "WrIsActive" boolean,
    "WrIsSuperAdmin" boolean,
    "WrCreatedBy" integer,
    "WrCreatedDate" timestamp with time zone,
    "WrCreatedType" integer,
    "WrModifyBy" integer,
    "WrModifyDate" timestamp with time zone,
    "WrModifyType" integer,
    "WrParentId" integer,
    "WrIsDelete" boolean DEFAULT false,
    "WrDeleteBy" integer,
    "WrDeleteDate" timestamp with time zone,
    "WrAllowMultipleLogin" boolean,
    "WrSubAdminId" integer,
    "WrUserIp" character varying(200),
    "wrEventTypeId" integer DEFAULT 0,
    "wrCompetitionId" integer DEFAULT 0,
    "wrParentTree" character varying,
    "WrOTPEnable" boolean DEFAULT false,
    "WeOTPType" integer,
    "WrUuid" character varying(1000)
);


--
-- Name: tblUsers_WrUserId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblUsers_WrUserId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblUsers_WrUserId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblUsers_WrUserId_seq" OWNED BY public."tblUsers"."WrUserId";


--
-- Name: tblVideoLibrary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblVideoLibrary" (
    "wrId" integer NOT NULL,
    "wrTitle" character varying,
    "wrIsPermanent" boolean DEFAULT false,
    "wrFrom" timestamp with time zone,
    "wrTo" timestamp with time zone,
    "wrTag" character varying,
    "wrSEO" text,
    "wrDescription" text,
    "wrVideoURL" text,
    "wrType" integer,
    "wrCommentaryId" integer,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp with time zone,
    "wrVideo" character varying,
    "wrVideoPath" character varying,
    "wrCreatedDate" timestamp with time zone DEFAULT now(),
    "wrIsActive" boolean DEFAULT false,
    "wrDisplayOrder" integer,
    "wrWhitelabelId" integer[],
    "wrViewCount" integer DEFAULT 0
);


--
-- Name: tblVideoLibrary_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblVideoLibrary_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblVideoLibrary_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblVideoLibrary_wrId_seq" OWNED BY public."tblVideoLibrary"."wrId";


--
-- Name: tblWhitelabel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."tblWhitelabel" (
    "wrId" integer NOT NULL,
    "wrDomain" character varying,
    "wrImagepath" character varying,
    "wrIsActive" boolean,
    "wrCreatedBy" integer,
    "wrCreatedAt" timestamp with time zone,
    "wrUpdatedBy" integer,
    "wrUpdatedAt" timestamp with time zone,
    "wrIsDeleted" boolean DEFAULT false,
    "wrDeletedBy" integer,
    "wrDeletedAt" timestamp with time zone,
    "wrIsDemoClientLogin" boolean DEFAULT false,
    "wrIsDemoClientEnableInIOS" boolean DEFAULT false,
    "wrIsRecatchaEnable" boolean,
    "wrRecatchKey" character varying,
    "wrIsGoogleLogin" boolean,
    "wrGoogle_Key" character varying,
    "wrClientOTP" character varying,
    "wrIsDefault" boolean DEFAULT false,
    "wrCreatedDate" timestamp with time zone DEFAULT now(),
    "wrGoogle_Secret" text,
    "wrMailSettingId" integer,
    "wrLogo" text,
    "wrFavicon" text,
    "wrRecatchSecret" character varying,
    "wrIsGoogleLoginMobile" boolean DEFAULT false,
    "wrGoogleKeyMobile" character varying,
    "wrGoogleSecretMobile" text,
    "wrIsRecatchaEnableMobile" boolean DEFAULT false,
    "wrRecatchKeyMobile" character varying,
    "wrRecatchSecretMobile" character varying
);


--
-- Name: tblWhitelabel_wrId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."tblWhitelabel_wrId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tblWhitelabel_wrId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."tblWhitelabel_wrId_seq" OWNED BY public."tblWhitelabel"."wrId";


--
-- Name: tblActivityLogs wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblActivityLogs" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblActivityLogs_wrId_seq"'::regclass);


--
-- Name: tblAdvertise wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblAdvertise" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblAdvertise_wrId_seq"'::regclass);


--
-- Name: tblArticles wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblArticles" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblArticles_wrId_seq"'::regclass);


--
-- Name: tblBlocks wrBlockId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblBlocks" ALTER COLUMN "wrBlockId" SET DEFAULT nextval('public."tblBlocks_wrBlockId_seq"'::regclass);


--
-- Name: tblClient wrClientId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClient" ALTER COLUMN "wrClientId" SET DEFAULT nextval('public."tblClient_wrClientId_seq"'::regclass);


--
-- Name: tblClientVaultKey wrKeyId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClientVaultKey" ALTER COLUMN "wrKeyId" SET DEFAULT nextval('public."tblClientVaultKey_wrKeyId_seq"'::regclass);


--
-- Name: tblConfigs wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblConfigs" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblConfigs_wrId_seq"'::regclass);


--
-- Name: tblCountryCodes wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblCountryCodes" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblCountryCodes_wrId_seq"'::regclass);


--
-- Name: tblDeletedClients wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDeletedClients" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblDeletedClients_wrId_seq"'::regclass);


--
-- Name: tblDevices wrDeviceId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDevices" ALTER COLUMN "wrDeviceId" SET DEFAULT nextval('public."tblDevices_wrDeviceId_seq"'::regclass);


--
-- Name: tblEncryptedData wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblEncryptedData" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblEncryptedData_wrId_seq"'::regclass);


--
-- Name: tblErrorLogs wrErrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblErrorLogs" ALTER COLUMN "wrErrId" SET DEFAULT nextval('public."tblErrorLogs_wrErrId_seq"'::regclass);


--
-- Name: tblLibraryImages wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblLibraryImages" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblLibraryImages_wrId_seq"'::regclass);


--
-- Name: tblMailSettings wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMailSettings" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblMailSettings_wrId_seq"'::regclass);


--
-- Name: tblMenuItemTypes wrMenuItemTypeId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMenuItemTypes" ALTER COLUMN "wrMenuItemTypeId" SET DEFAULT nextval('public."tblMenuItemTypes_wrMenuItemTypeId_seq"'::regclass);


--
-- Name: tblMenuItems wrMenuItemId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMenuItems" ALTER COLUMN "wrMenuItemId" SET DEFAULT nextval('public."tblMenuItems_wrMenuItemId_seq"'::regclass);


--
-- Name: tblMenuTypes wrMenuTypeId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMenuTypes" ALTER COLUMN "wrMenuTypeId" SET DEFAULT nextval('public."tblMenuTypes_wrMenuTypeId_seq"'::regclass);


--
-- Name: tblNotificationConfig wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblNotificationConfig" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblNotificationConfig_wrId_seq"'::regclass);


--
-- Name: tblPackages wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPackages" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblPackages_wrId_seq"'::regclass);


--
-- Name: tblPageAliases wrPageAliasId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPageAliases" ALTER COLUMN "wrPageAliasId" SET DEFAULT nextval('public."tblPageAliases_wrPageAliasId_seq"'::regclass);


--
-- Name: tblPageFormats wrPageFormatId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPageFormats" ALTER COLUMN "wrPageFormatId" SET DEFAULT nextval('public."tblPageFormats_wrPageFormatId_seq"'::regclass);


--
-- Name: tblPages wrPageId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPages" ALTER COLUMN "wrPageId" SET DEFAULT nextval('public."tblPages_wrPageId_seq"'::regclass);


--
-- Name: tblPaymentMethods wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPaymentMethods" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblPaymentMethods_wrId_seq"'::regclass);


--
-- Name: tblPermissions wrPermissionId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPermissions" ALTER COLUMN "wrPermissionId" SET DEFAULT nextval('public."tblPermissions_wrPermissionId_seq"'::regclass);


--
-- Name: tblPhotoLibrary wrPhotoLibraryId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPhotoLibrary" ALTER COLUMN "wrPhotoLibraryId" SET DEFAULT nextval('public."tblPhotoLibrary_wrPhotoLibraryId_seq"'::regclass);


--
-- Name: tblPlanUpgradeRequests wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPlanUpgradeRequests" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblPlanUpgradeRequests_wrId_seq"'::regclass);


--
-- Name: tblRoles wrRoleId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblRoles" ALTER COLUMN "wrRoleId" SET DEFAULT nextval('public."tblRoles_wrRoleId_seq"'::regclass);


--
-- Name: tblSocialMedias wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblSocialMedias" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblSocialMedias_wrId_seq"'::regclass);


--
-- Name: tblTabs wrTabId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblTabs" ALTER COLUMN "wrTabId" SET DEFAULT nextval('public."tblTabs_wrTabId_seq"'::regclass);


--
-- Name: tblUserLoginInfos WrID; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblUserLoginInfos" ALTER COLUMN "WrID" SET DEFAULT nextval('public."tblUserLoginInfos_WrID_seq"'::regclass);


--
-- Name: tblUserdeleteLogs wrUserDeletelogId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblUserdeleteLogs" ALTER COLUMN "wrUserDeletelogId" SET DEFAULT nextval('public."tblUserdeleteLogs_wrUserDeletelogId_seq"'::regclass);


--
-- Name: tblUsers WrUserId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblUsers" ALTER COLUMN "WrUserId" SET DEFAULT nextval('public."tblUsers_WrUserId_seq"'::regclass);


--
-- Name: tblVideoLibrary wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblVideoLibrary" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblVideoLibrary_wrId_seq"'::regclass);


--
-- Name: tblWhitelabel wrId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblWhitelabel" ALTER COLUMN "wrId" SET DEFAULT nextval('public."tblWhitelabel_wrId_seq"'::regclass);


--
-- Name: tblClientSockets "tblClientSockets_pKey"; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClientSockets"
    ADD CONSTRAINT """tblClientSockets_pKey""" PRIMARY KEY ("wrId");


--
-- Name: tblClientSockets "tblClientSockets_wrUrl_ukey"; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClientSockets"
    ADD CONSTRAINT """tblClientSockets_wrUrl_ukey""" UNIQUE ("wrUrl");


--
-- Name: tblAPIEndpoints tblAPIEndpoints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblAPIEndpoints"
    ADD CONSTRAINT "tblAPIEndpoints_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblActivityLogs tblActivityLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblActivityLogs"
    ADD CONSTRAINT "tblActivityLogs_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblAdvertise tblAdvertise_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblAdvertise"
    ADD CONSTRAINT "tblAdvertise_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblAPIs tblApis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblAPIs"
    ADD CONSTRAINT "tblApis_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblArticles tblArticles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblArticles"
    ADD CONSTRAINT "tblArticles_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblBanner tblBanner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblBanner"
    ADD CONSTRAINT "tblBanner_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblBlocks tblBlocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblBlocks"
    ADD CONSTRAINT "tblBlocks_pkey" PRIMARY KEY ("wrBlockId");


--
-- Name: tblClientVaultEntries tblClientVaultEntries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClientVaultEntries"
    ADD CONSTRAINT "tblClientVaultEntries_pkey" PRIMARY KEY ("wrEntryId");


--
-- Name: tblClientVaultKey tblClientVaultKey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClientVaultKey"
    ADD CONSTRAINT "tblClientVaultKey_pkey" PRIMARY KEY ("wrKeyId");


--
-- Name: tblClient tblClient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClient"
    ADD CONSTRAINT "tblClient_pkey" PRIMARY KEY ("wrClientId");


--
-- Name: tblClient tblClient_wrEmail_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClient"
    ADD CONSTRAINT "tblClient_wrEmail_key" UNIQUE ("wrEmail");


--
-- Name: tblClient tblClient_wrGoogleId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClient"
    ADD CONSTRAINT "tblClient_wrGoogleId_key" UNIQUE ("wrGoogleId");


--
-- Name: tblConfigs tblConfigs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblConfigs"
    ADD CONSTRAINT "tblConfigs_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblCountryCodes tblCountryCodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblCountryCodes"
    ADD CONSTRAINT "tblCountryCodes_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblDeletedClientActivityLogs tblDeletedClientActivityLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDeletedClientActivityLogs"
    ADD CONSTRAINT "tblDeletedClientActivityLogs_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblDeletedClientVaultEntries tblDeletedClientVaultEntries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDeletedClientVaultEntries"
    ADD CONSTRAINT "tblDeletedClientVaultEntries_pkey" PRIMARY KEY ("wrEntryId");


--
-- Name: tblDeletedClientVaultKeys tblDeletedClientVaultKeys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDeletedClientVaultKeys"
    ADD CONSTRAINT "tblDeletedClientVaultKeys_pkey" PRIMARY KEY ("wrKeyId");


--
-- Name: tblDeletedClients tblDeletedClients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDeletedClients"
    ADD CONSTRAINT "tblDeletedClients_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblDevices tblDevices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDevices"
    ADD CONSTRAINT "tblDevices_pkey" PRIMARY KEY ("wrDeviceId");


--
-- Name: tblEncryptedData tblEncryptedData_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblEncryptedData"
    ADD CONSTRAINT "tblEncryptedData_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblErrorLogs tblErrorLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblErrorLogs"
    ADD CONSTRAINT "tblErrorLogs_pkey" PRIMARY KEY ("wrErrId");


--
-- Name: tblLibraryImages tblLibraryImages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblLibraryImages"
    ADD CONSTRAINT "tblLibraryImages_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblMailSettings tblMailSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMailSettings"
    ADD CONSTRAINT "tblMailSettings_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblMailSettings tblMailSettings_wrEmail_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMailSettings"
    ADD CONSTRAINT "tblMailSettings_wrEmail_key" UNIQUE ("wrEmail");


--
-- Name: tblMenuItemTypes tblMenuItemTypes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMenuItemTypes"
    ADD CONSTRAINT "tblMenuItemTypes_pkey" PRIMARY KEY ("wrMenuItemTypeId");


--
-- Name: tblMenuItems tblMenuItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMenuItems"
    ADD CONSTRAINT "tblMenuItems_pkey" PRIMARY KEY ("wrMenuItemId");


--
-- Name: tblMenuTypes tblMenuTypes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMenuTypes"
    ADD CONSTRAINT "tblMenuTypes_pkey" PRIMARY KEY ("wrMenuTypeId");


--
-- Name: tblNews tblNews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblNews"
    ADD CONSTRAINT "tblNews_pkey" PRIMARY KEY ("wrNewsId");


--
-- Name: tblNotificationConfig tblNotificationConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblNotificationConfig"
    ADD CONSTRAINT "tblNotificationConfig_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblNotificationLogs tblNotificationLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblNotificationLogs"
    ADD CONSTRAINT "tblNotificationLogs_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblNotifications tblNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblNotifications"
    ADD CONSTRAINT "tblNotification_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblPackages tblPackages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPackages"
    ADD CONSTRAINT "tblPackages_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblPageAliases tblPageAliases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPageAliases"
    ADD CONSTRAINT "tblPageAliases_pkey" PRIMARY KEY ("wrPageAliasId");


--
-- Name: tblPageFormats tblPageFormats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPageFormats"
    ADD CONSTRAINT "tblPageFormats_pkey" PRIMARY KEY ("wrPageFormatId");


--
-- Name: tblPages tblPages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPages"
    ADD CONSTRAINT "tblPages_pkey" PRIMARY KEY ("wrPageId");


--
-- Name: tblPaymentMethods tblPaymentMethods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPaymentMethods"
    ADD CONSTRAINT "tblPaymentMethods_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblPermissions tblPermissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPermissions"
    ADD CONSTRAINT "tblPermissions_pkey" PRIMARY KEY ("wrPermissionId");


--
-- Name: tblPhotoLibrary tblPhotoLibrary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPhotoLibrary"
    ADD CONSTRAINT "tblPhotoLibrary_pkey" PRIMARY KEY ("wrPhotoLibraryId");


--
-- Name: tblPlanUpgradeRequests tblPlanUpgradeRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPlanUpgradeRequests"
    ADD CONSTRAINT "tblPlanUpgradeRequests_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblRoles tblRoles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblRoles"
    ADD CONSTRAINT "tblRoles_pkey" PRIMARY KEY ("wrRoleId");


--
-- Name: tblSocialMedias tblSocialMedias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblSocialMedias"
    ADD CONSTRAINT "tblSocialMedias_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblTabs tblTabs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblTabs"
    ADD CONSTRAINT "tblTabs_pkey" PRIMARY KEY ("wrTabId");


--
-- Name: tblTemplate tblTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblTemplate"
    ADD CONSTRAINT "tblTemplate_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblUserLoginInfos tblUserLoginInfos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblUserLoginInfos"
    ADD CONSTRAINT "tblUserLoginInfos_pkey" PRIMARY KEY ("WrID");


--
-- Name: tblUserdeleteLogs tblUserdeleteLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblUserdeleteLogs"
    ADD CONSTRAINT "tblUserdeleteLogs_pkey" PRIMARY KEY ("wrUserDeletelogId");


--
-- Name: tblUsers tblUsers_WrUserName_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblUsers"
    ADD CONSTRAINT "tblUsers_WrUserName_key" UNIQUE ("WrUserName");


--
-- Name: tblUsers tblUsers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblUsers"
    ADD CONSTRAINT "tblUsers_pkey" PRIMARY KEY ("WrUserId");


--
-- Name: tblVideoLibrary tblVideoLibrary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblVideoLibrary"
    ADD CONSTRAINT "tblVideoLibrary_pkey" PRIMARY KEY ("wrId");


--
-- Name: tblWhitelabel tblWhitelabel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblWhitelabel"
    ADD CONSTRAINT "tblWhitelabel_pkey" PRIMARY KEY ("wrId");


--
-- Name: idxClientUsernameUnique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idxClientUsernameUnique" ON public."tblClient" USING btree (lower(("wrUsername")::text)) WHERE (("wrIsDeleted" = false) AND ("wrUsername" IS NOT NULL));


--
-- Name: idxClientVaultEntriesClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxClientVaultEntriesClientId" ON public."tblClientVaultEntries" USING btree ("wrClientId") WHERE ("wrIsDeleted" = false);


--
-- Name: idxClientVaultKeyClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxClientVaultKeyClientId" ON public."tblClientVaultKey" USING btree ("wrClientId") WHERE ("wrIsActive" = true);


--
-- Name: idxDeletedClientActivityLogsClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxDeletedClientActivityLogsClientId" ON public."tblDeletedClientActivityLogs" USING btree ("wrClientId");


--
-- Name: idxDeletedClientActivityLogsDeletedClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxDeletedClientActivityLogsDeletedClientId" ON public."tblDeletedClientActivityLogs" USING btree ("wrDeletedClientId");


--
-- Name: idxDeletedClientVaultEntriesClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxDeletedClientVaultEntriesClientId" ON public."tblDeletedClientVaultEntries" USING btree ("wrClientId");


--
-- Name: idxDeletedClientVaultEntriesDeletedClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxDeletedClientVaultEntriesDeletedClientId" ON public."tblDeletedClientVaultEntries" USING btree ("wrDeletedClientId");


--
-- Name: idxDeletedClientVaultKeysClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxDeletedClientVaultKeysClientId" ON public."tblDeletedClientVaultKeys" USING btree ("wrClientId");


--
-- Name: idxDeletedClientVaultKeysDeletedClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxDeletedClientVaultKeysDeletedClientId" ON public."tblDeletedClientVaultKeys" USING btree ("wrDeletedClientId");


--
-- Name: idxDeletedClientsOriginalClientId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxDeletedClientsOriginalClientId" ON public."tblDeletedClients" USING btree ("wrOriginalClientId");


--
-- Name: idxPaymentMethodOneDefault; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idxPaymentMethodOneDefault" ON public."tblPaymentMethods" USING btree ("wrIsDefault") WHERE (("wrIsDefault" = true) AND ("wrIsDeleted" = false));


--
-- Name: idxPlanUpgradeOnePendingPerClient; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idxPlanUpgradeOnePendingPerClient" ON public."tblPlanUpgradeRequests" USING btree ("wrClientId") WHERE (("wrStatus")::text = 'PENDING'::text);


--
-- Name: idxPlanUpgradeStatus; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idxPlanUpgradeStatus" ON public."tblPlanUpgradeRequests" USING btree ("wrStatus");


--
-- Name: idxPlanUpgradeTransferCodeUnique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idxPlanUpgradeTransferCodeUnique" ON public."tblPlanUpgradeRequests" USING btree ("wrTransferCode");


--
-- Name: idx_tblEncryptedData_wrkey; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_tblEncryptedData_wrkey" ON public."tblEncryptedData" USING btree ("wrKey");


--
-- Name: idx_tblencrypteddata_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tblencrypteddata_value ON public."tblEncryptedData" USING btree ("wrValue");


--
-- Name: idx_tblpermissions_role_tabid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tblpermissions_role_tabid ON public."tblPermissions" USING btree ("wrRoleId", "wrTabId");


--
-- Name: idx_tbltabs_main; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tbltabs_main ON public."tblTabs" USING btree ("wrDisplayType", "wrTabName", "wrIsDeleted");


--
-- Name: idx_tbluserlogininfos_composite; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tbluserlogininfos_composite ON public."tblUserLoginInfos" USING btree ("wrToken", "wrIsLogin", "WrUserType", "WrUserId");


--
-- Name: tblActivityLogs tblActivityLogs_wrClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblActivityLogs"
    ADD CONSTRAINT "tblActivityLogs_wrClientId_fkey" FOREIGN KEY ("wrClientId") REFERENCES public."tblClient"("wrClientId");


--
-- Name: tblClientVaultEntries tblClientVaultEntries_wrClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClientVaultEntries"
    ADD CONSTRAINT "tblClientVaultEntries_wrClientId_fkey" FOREIGN KEY ("wrClientId") REFERENCES public."tblClient"("wrClientId");


--
-- Name: tblClientVaultKey tblClientVaultKey_wrClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClientVaultKey"
    ADD CONSTRAINT "tblClientVaultKey_wrClientId_fkey" FOREIGN KEY ("wrClientId") REFERENCES public."tblClient"("wrClientId");


--
-- Name: tblClient tblClient_wrPackageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClient"
    ADD CONSTRAINT "tblClient_wrPackageId_fkey" FOREIGN KEY ("wrPackageId") REFERENCES public."tblPackages"("wrId");


--
-- Name: tblClient tblClient_wrWhitelabelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblClient"
    ADD CONSTRAINT "tblClient_wrWhitelabelId_fkey" FOREIGN KEY ("wrWhitelabelId") REFERENCES public."tblWhitelabel"("wrId") ON DELETE SET NULL;


--
-- Name: tblDeletedClientActivityLogs tblDeletedClientActivityLogs_wrDeletedClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDeletedClientActivityLogs"
    ADD CONSTRAINT "tblDeletedClientActivityLogs_wrDeletedClientId_fkey" FOREIGN KEY ("wrDeletedClientId") REFERENCES public."tblDeletedClients"("wrId");


--
-- Name: tblDeletedClientVaultEntries tblDeletedClientVaultEntries_wrDeletedClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDeletedClientVaultEntries"
    ADD CONSTRAINT "tblDeletedClientVaultEntries_wrDeletedClientId_fkey" FOREIGN KEY ("wrDeletedClientId") REFERENCES public."tblDeletedClients"("wrId");


--
-- Name: tblDeletedClientVaultKeys tblDeletedClientVaultKeys_wrDeletedClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblDeletedClientVaultKeys"
    ADD CONSTRAINT "tblDeletedClientVaultKeys_wrDeletedClientId_fkey" FOREIGN KEY ("wrDeletedClientId") REFERENCES public."tblDeletedClients"("wrId");


--
-- Name: tblMenuTypes tblMenuTypes_wrBlockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblMenuTypes"
    ADD CONSTRAINT "tblMenuTypes_wrBlockId_fkey" FOREIGN KEY ("wrBlockId") REFERENCES public."tblBlocks"("wrBlockId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tblPages tblPages_wrPageFormatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPages"
    ADD CONSTRAINT "tblPages_wrPageFormatId_fkey" FOREIGN KEY ("wrPageFormatId") REFERENCES public."tblPageFormats"("wrPageFormatId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tblPlanUpgradeRequests tblPlanUpgradeRequests_wrClientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPlanUpgradeRequests"
    ADD CONSTRAINT "tblPlanUpgradeRequests_wrClientId_fkey" FOREIGN KEY ("wrClientId") REFERENCES public."tblClient"("wrClientId");


--
-- Name: tblPlanUpgradeRequests tblPlanUpgradeRequests_wrCurrentPackageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPlanUpgradeRequests"
    ADD CONSTRAINT "tblPlanUpgradeRequests_wrCurrentPackageId_fkey" FOREIGN KEY ("wrCurrentPackageId") REFERENCES public."tblPackages"("wrId");


--
-- Name: tblPlanUpgradeRequests tblPlanUpgradeRequests_wrPaymentMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPlanUpgradeRequests"
    ADD CONSTRAINT "tblPlanUpgradeRequests_wrPaymentMethodId_fkey" FOREIGN KEY ("wrPaymentMethodId") REFERENCES public."tblPaymentMethods"("wrId");


--
-- Name: tblPlanUpgradeRequests tblPlanUpgradeRequests_wrRequestedPackageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblPlanUpgradeRequests"
    ADD CONSTRAINT "tblPlanUpgradeRequests_wrRequestedPackageId_fkey" FOREIGN KEY ("wrRequestedPackageId") REFERENCES public."tblPackages"("wrId");


--
-- Name: tblUserLoginInfos tblUserLoginInfos_WrUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblUserLoginInfos"
    ADD CONSTRAINT "tblUserLoginInfos_WrUserId_fkey" FOREIGN KEY ("WrUserId") REFERENCES public."tblUsers"("WrUserId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tblWhitelabel tblWhitelabel_wrMailSettingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."tblWhitelabel"
    ADD CONSTRAINT "tblWhitelabel_wrMailSettingId_fkey" FOREIGN KEY ("wrMailSettingId") REFERENCES public."tblMailSettings"("wrId") ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict scvYagqJS543JQsQjOGhU7asWLK16ezbjIAH0GUPDjSx3DQ87w9geYHsPeBRiJi


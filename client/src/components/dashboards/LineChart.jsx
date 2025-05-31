import { useTheme } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import { useEffect, useState } from "react";
import api from "../../action/axios-interceptor.js";
import storeToken from "../../hooks/storeToken.js";
import useCountries from "../../hooks/useCountries";
import { tokens } from "../../theme";

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [LineChartData, setLineChartData] = useState([]);
  const { getByValue } = useCountries();
  const { role } = storeToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (role === "admin") {
          response = await api.get("/api/admin/dashboard/line-chart");
        } else {
          response = await api.get("/api/statistics/line-chart");
        }

        // Lọc để chỉ lấy series "places"
        const placesData = response.data.find((item) => item.id === "places");

        // Nếu không tìm thấy series "places" hoặc dữ liệu rỗng
        if (!placesData) {
          // Tạo series "places" rỗng
          setLineChartData([
            {
              id: "places",
              color: "hsla(233, 100%, 68%, 1)", // Màu mặc định cho places
              data: [{ x: "No Data", y: 0 }],
            },
          ]);
          return;
        }

        // Nếu places có dữ liệu rỗng, thêm một điểm dữ liệu giả
        if (!placesData.data || placesData.data.length === 0) {
          placesData.data = [{ x: "No Data", y: 0 }];
        }

        // Xử lý dữ liệu places
        const updatedData = {
          ...placesData,
          data: placesData.data.map((point) => ({
            ...point,
            x: getByValue(point.x)?.label || point.x,
          })),
        };

        setLineChartData([updatedData]); // Chỉ hiển thị series places
      } catch (error) {
        console.error("Error fetching line chart data:", error);
        // Tạo dữ liệu mẫu khi có lỗi
        setLineChartData([
          {
            id: "places",
            color: "hsla(233, 100%, 68%, 1)",
            data: [{ x: "Error", y: 0 }],
          },
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {LineChartData && LineChartData.length > 0 ? (
        <ResponsiveLine
          data={LineChartData}
          theme={{
            axis: {
              domain: {
                line: {
                  stroke: colors.grey[100],
                },
              },
              legend: {
                text: {
                  fill: colors.grey[100],
                },
              },
              ticks: {
                line: {
                  stroke: colors.grey[100],
                  strokeWidth: 1,
                },
                text: {
                  fill: colors.grey[100],
                },
              },
            },
            legends: {
              text: {
                fill: colors.grey[100],
              },
            },
            tooltip: {
              container: {
                color: colors.primary[500],
              },
            },
          }}
          layers={[
            "grid",
            "markers",
            "axes",
            "areas",
            "crosshair",
            "lines",
            "points",
            "slices",
            "mesh",
            "legends",
          ]}
          enablePoints={true}
          enableArea={true}
          enableSlices="x"
          enableCrosshair={true}
          enablePointLabel={false}
          isInteractive={true}
          animate={true}
          motionConfig="gentle"
          pointLabel="y"
          areaBlendMode="multiply"
          debugMesh={false}
          debugSlices={false}
          sliceTooltip={({ slice }) => {
            return (
              <div style={{ color: colors.grey[100] }}>
                <strong>{slice.id}</strong>
                <br />
                {slice.data.map((point) => (
                  <div key={point.id}>
                    {point.data.x}: {point.data.y}
                  </div>
                ))}
              </div>
            );
          }}
          tooltip={({ point }) => (
            <div style={{ color: colors.grey[100] }}>
              <strong>{point.serieId}</strong>
              <br />
              {point.data.x}: {point.data.y}
            </div>
          )}
          crosshairType="x"
          role="img"
          colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }}
          lineWidth={3}
          areaBaselineValue={0}
          areaOpacity={0.15}
          defs={[
            {
              id: "gradientA",
              type: "linearGradient",
              colors: [
                { offset: 0, color: "inherit", opacity: 0 },
                { offset: 100, color: "inherit", opacity: 0.15 },
              ],
            },
          ]}
          fill={[{ match: "*", id: "gradientA" }]}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            stacked: true,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="catmullRom"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 0,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? undefined : "Countries",
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            orient: "left",
            tickValues: 5,
            tickSize: 3,
            tickPadding: 5,
            tickRotation: 0,
            legend: isDashboard ? undefined : "Number of Places",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          enableGridX={false}
          enableGridY={false}
          pointSize={8}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      ) : (
        <div
          style={{
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: colors.grey[100] }}>Loading chart data...</p>
        </div>
      )}
    </>
  );
};

export default LineChart;
